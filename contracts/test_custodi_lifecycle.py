"""Lifecycle tests for Custodi's native-GEN settlement paths.

These tests use a deliberately tiny GenLayer shim, so they exercise the contract's
state and outgoing transfer decisions without needing a running chain.
"""

import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path


TRANSFERS = []


class _Decorator:
    def __call__(self, value):
        return value

    @property
    def payable(self):
        return self


class _Address(str):
    pass


class _Recipient:
    def __init__(self, address):
        self.address = str(address)

    def emit_transfer(self, value):
        TRANSFERS.append((self.address, int(value)))


class _TreeMap(dict):
    pass


def load_contract():
    public = types.SimpleNamespace(write=_Decorator(), view=_Decorator())
    gl = types.SimpleNamespace(
        Contract=object,
        public=public,
        evm=types.SimpleNamespace(contract_interface=lambda _: _Recipient),
        vm=types.SimpleNamespace(UserError=ValueError),
        message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex=""), value=0),
        message_raw={},
    )
    module = types.ModuleType("genlayer")
    module.gl = gl
    module.TreeMap = _TreeMap
    module.u256 = int
    module.Address = _Address
    sys.modules["genlayer"] = module
    path = Path(__file__).with_name("custodi.py")
    spec = importlib.util.spec_from_file_location("custodi_under_test", path)
    loaded = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(loaded)
    return loaded, gl


class CustodiLifecycleTests(unittest.TestCase):
    lender = "0x1111111111111111111111111111111111111111"
    borrower = "0x2222222222222222222222222222222222222222"

    def setUp(self):
        TRANSFERS.clear()
        self.module, self.gl = load_contract()
        self.contract = self.module.Custodi()

    def sender(self, address):
        self.gl.message.sender_address.as_hex = address

    def create(self, deposit=100):
        self.sender(self.lender)
        self.gl.message.value = deposit
        return self.contract.create_handoff("Camera kit", "camera", self.borrower, "No scratches or missing parts.", "soon")

    def read_case(self, case_id):
        return json.loads(self.contract.get_case(case_id))

    def prepare_return(self):
        case_id = self.create()
        self.sender(self.borrower)
        self.contract.accept_handoff(case_id)
        self.contract.submit_return_evidence(case_id, "https://example.com/return", "Returned")
        return case_id

    def test_lender_release_pays_full_deposit_to_borrower(self):
        case_id = self.prepare_return()
        self.sender(self.lender)
        self.contract.release_without_dispute(case_id)
        self.assertEqual(TRANSFERS, [(self.borrower, 100)])
        self.assertEqual(self.read_case(case_id)["paid_to_borrower"], "100")

    def test_each_review_allocation_is_paid(self):
        outcomes = {
            "no_new_damage": [(self.borrower, 100)],
            "minor_wear": [(self.borrower, 80), (self.lender, 20)],
            "material_damage": [(self.lender, 100)],
        }
        for verdict, expected_transfers in outcomes.items():
            with self.subTest(verdict=verdict):
                TRANSFERS.clear()
                case_id = self.prepare_return()
                self.contract._review_damage = lambda *_: json.dumps({"verdict_class": verdict, "confidence": 90, "reasoning": "test"})
                self.sender(self.borrower)
                self.contract.request_damage_review(case_id)
                self.assertEqual(TRANSFERS, expected_transfers)

    def test_unaccepted_deposit_can_be_recovered_by_lender(self):
        case_id = self.create()
        self.contract.recover_unaccepted(case_id)
        self.assertEqual(TRANSFERS, [(self.lender, 100)])
        self.assertEqual(self.read_case(case_id)["status"], "recovered_unaccepted")

    def test_undetermined_review_can_be_recovered_by_either_party(self):
        case_id = self.prepare_return()
        self.contract._review_damage = lambda *_: '{"verdict_class":"undetermined","confidence":0,"reasoning":"unclear"}'
        self.sender(self.borrower)
        self.contract.request_damage_review(case_id)
        self.assertEqual(TRANSFERS, [])
        self.sender(self.lender)
        self.contract.recover_undetermined(case_id)
        self.assertEqual(TRANSFERS, [(self.borrower, 100)])
        self.assertEqual(self.read_case(case_id)["status"], "recovered_undetermined")

    def test_case_detail_serializes_case_ids_as_strings(self):
        source = Path(__file__).parents[1] / "app" / "cases" / "[id]" / "page.tsx"
        page = source.read_text(encoding="utf-8")
        self.assertIn('readCustodi("get_case", [String(id)])', page)
        self.assertNotIn('readCustodi("get_case", [Number(id)])', page)
        for method in ("accept_handoff", "release_without_dispute", "request_damage_review"):
            self.assertIn('runWrite("' + method + '", [String(item.id)])', page)


if __name__ == "__main__":
    unittest.main()
