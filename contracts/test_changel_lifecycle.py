"""Direct lifecycle tests for Changel's release-outcome allocations."""
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path

TRANSFERS = []
class _Decorator:
    def __call__(self, value): return value
    @property
    def payable(self): return self
class _Address(str): pass
class _Recipient:
    def __init__(self, address): self.address = str(address)
    def emit_transfer(self, value): TRANSFERS.append((self.address, int(value)))
class _TreeMap(dict): pass
def load_contract():
    public = types.SimpleNamespace(write=_Decorator(), view=_Decorator())
    gl = types.SimpleNamespace(Contract=object, public=public, evm=types.SimpleNamespace(contract_interface=lambda _: _Recipient), vm=types.SimpleNamespace(UserError=ValueError), message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex=""), value=0), message_raw={"datetime": "2026-01-01T00:00"})
    module = types.ModuleType("genlayer"); module.gl=gl; module.TreeMap=_TreeMap; module.u256=int; module.Address=_Address; sys.modules["genlayer"] = module
    spec=importlib.util.spec_from_file_location("changel_under_test", Path(__file__).with_name("changel.py")); loaded=importlib.util.module_from_spec(spec); spec.loader.exec_module(loaded); return loaded, gl
class ChangelLifecycleTests(unittest.TestCase):
    team="0x1111111111111111111111111111111111111111"; challenger="0x2222222222222222222222222222222222222222"
    def setUp(self): TRANSFERS.clear(); self.module, self.gl=load_contract(); self.contract=self.module.Changel()
    def sender(self, address): self.gl.message.sender_address.as_hex=address
    def create(self, bond=100):
        self.gl.message_raw["datetime"]="2026-01-01T00:00"; self.sender(self.team); self.gl.message.value=bond
        return self.contract.create_promise("v2 security release", "security", "https://github.com/acme/widget", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", self.challenger, "Ship the authenticated API migration and security remediation notes.", "2026-12-31T00:00")
    def evidence(self, promise_id):
        self.sender(self.team); self.contract.submit_release_evidence(promise_id, "https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md", "Release notes"); self.sender(self.challenger); self.contract.submit_counter_evidence(promise_id, "https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md", "Counter")
    def test_all_explicit_outcomes_pay_documented_bands(self):
        expected={"fulfilled":[(self.team,100)], "partially_fulfilled":[(self.team,70),(self.challenger,30)], "not_fulfilled":[(self.challenger,100)]}
        for outcome, transfers in expected.items():
            with self.subTest(outcome=outcome):
                TRANSFERS.clear(); promise_id=self.create(); self.evidence(promise_id)
                self.contract._review=lambda *_: json.dumps({"outcome":outcome,"confidence":87,"reasoning":"test"})
                self.gl.message_raw["datetime"]="2027-01-01T00:00"
                self.sender(self.challenger); self.contract.challenge_promise(promise_id)
                self.assertEqual(TRANSFERS, transfers)
    def test_counter_evidence_must_match_bound_repository_and_release(self):
        promise_id=self.create(); self.sender(self.challenger)
        with self.assertRaises(ValueError): self.contract.submit_counter_evidence(promise_id,"https://github.com/elsewhere/repo/releases/tag/v2.0.0","Wrong repo")
        self.contract.submit_counter_evidence(promise_id,"https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md","Bound counter evidence")
    def test_undetermined_bond_can_be_recovered(self):
        promise_id=self.create(); self.evidence(promise_id); self.contract._review=lambda *_:'{"outcome":"undetermined","confidence":0,"reasoning":"unavailable"}'; self.gl.message_raw["datetime"]="2027-01-01T00:00"
        self.sender(self.challenger); self.contract.challenge_promise(promise_id); self.assertEqual(TRANSFERS, [])
        self.contract.recover_undetermined(promise_id); self.assertEqual(TRANSFERS, [(self.team,100)])
    def test_render_failure_becomes_undetermined_with_attestation(self):
        promise_id=self.create(); self.evidence(promise_id); self.gl.message_raw["datetime"]="2027-01-01T00:00"
        class _Web:
            def render(self, *_args, **_kwargs): raise RuntimeError("unavailable")
        self.gl.nondet=types.SimpleNamespace(web=_Web())
        self.gl.eq_principle=types.SimpleNamespace(prompt_comparative=lambda leader, _principle: leader())
        self.sender(self.challenger); self.contract.challenge_promise(promise_id)
        record=json.loads(self.contract.get_promise(promise_id))
        self.assertEqual(record["status"], "undetermined")
        self.assertIn("render_failed", record["evidence_fingerprints"])
    def test_evidence_order_and_expiry_recovery_are_enforced(self):
        promise_id=self.create(); self.evidence(promise_id); self.sender(self.challenger)
        self.contract.submit_counter_evidence(promise_id,"https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md","Counter")
        ordered=self.contract._evidence_for(promise_id)
        self.assertEqual([x["kind"] for x in ordered][:2], ["release_evidence", "counter_evidence"])
        self.gl.message_raw["datetime"]="2027-01-01T00:00"
        with self.assertRaises(ValueError): self.contract.submit_counter_evidence(promise_id,"https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md","Late")
        empty=self.create(); self.gl.message_raw["datetime"]="2027-01-01T00:00"; self.sender(self.team); self.contract.recover_expired_without_evidence(empty)
        self.assertIn((self.team,100), TRANSFERS)
    def test_detail_client_uses_string_promise_id(self):
        source=(Path(__file__).parents[1] / "app" / "cases" / "[id]" / "page.tsx").read_text(encoding="utf-8")
        self.assertIn("String(id)", source)
    def test_lookalikes_slots_and_malformed_output_are_hostile(self):
        promise_id=self.create(); self.sender(self.team)
        with self.assertRaises(ValueError): self.contract.submit_release_evidence(promise_id,"https://evil.test/https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/README.md","lookalike")
        for number in range(4): self.contract.submit_release_evidence(promise_id,"https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/file"+str(number),"team")
        with self.assertRaises(ValueError): self.contract.submit_release_evidence(promise_id,"https://raw.githubusercontent.com/acme/widget/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/overflow","overflow")
        parsed=self.contract._parse('{"outcome":"fulfilled","reasoning":{"nested":true},"confidence":"bad"}')
        self.assertEqual(parsed["outcome"], "undetermined")
if __name__ == "__main__": unittest.main()
