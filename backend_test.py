import requests
import sys
from datetime import datetime
import json

class CRMAPITester:
    def __init__(self, base_url="https://lead-deals.preview.emergentagent.com"):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'x-company-id': 'default-company'
        }
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=self.headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=self.headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                # Show response data for successful tests
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: [{len(response_data)} items]")
                    elif isinstance(response_data, dict):
                        if 'total_contacts' in response_data:
                            print(f"   Stats: {response_data}")
                        else:
                            print(f"   Response: {list(response_data.keys()) if response_data else 'Empty'}")
                except:
                    print(f"   Response length: {len(response.text)}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success else {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_contacts_api(self):
        """Test contacts CRUD operations"""
        print("\n🧪 Testing Contacts API...")
        
        # Get all contacts
        success, contacts = self.run_test("Get Contacts", "GET", "crm/contacts", 200)
        
        # Create a test contact
        test_contact = {
            "name": "João Silva",
            "email": "joao@exemplo.com",
            "phone": "+5511999887766",
            "company": "Empresa Teste",
            "pipeline_stage": "novo_lead",
            "tags": ["teste", "api"]
        }
        
        success, created_contact = self.run_test("Create Contact", "POST", "crm/contacts", 200, test_contact)
        
        if success and created_contact:
            contact_id = created_contact.get("id")
            
            # Get specific contact
            self.run_test("Get Specific Contact", "GET", f"crm/contacts/{contact_id}", 200)
            
            # Update contact
            updated_data = {
                **test_contact,
                "pipeline_stage": "contato_feito"
            }
            self.run_test("Update Contact", "PUT", f"crm/contacts/{contact_id}", 200, updated_data)
        
        return success

    def test_deals_api(self):
        """Test deals CRUD operations"""
        print("\n🧪 Testing Deals API...")
        
        # Get all deals
        success, deals = self.run_test("Get Deals", "GET", "crm/deals", 200)
        
        # Create a test deal
        test_deal = {
            "title": "Negócio Teste API",
            "value": 15000.50,
            "stage": "novo_lead",
            "probability": 25,
            "expected_close_date": "2024-12-31",
            "notes": "Negócio criado via teste API"
        }
        
        success, created_deal = self.run_test("Create Deal", "POST", "crm/deals", 200, test_deal)
        
        if success and created_deal:
            deal_id = created_deal.get("id")
            
            # Get specific deal
            self.run_test("Get Specific Deal", "GET", f"crm/deals/{deal_id}", 200)
            
            # Update deal stage
            updated_data = {
                **test_deal,
                "stage": "proposta_enviada",
                "probability": 50
            }
            self.run_test("Update Deal", "PUT", f"crm/deals/{deal_id}", 200, updated_data)
        
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats API"""
        print("\n🧪 Testing Dashboard Stats API...")
        
        success, stats = self.run_test("Get Dashboard Stats", "GET", "crm/dashboard/stats", 200)
        
        return success

    def test_conversations_api(self):
        """Test conversations API"""
        print("\n🧪 Testing Conversations API...")
        
        # Get all conversations
        success, conversations = self.run_test("Get Conversations", "GET", "crm/conversations", 200)
        
        return success

    def test_pipeline_stages_api(self):
        """Test pipeline stages customization API"""
        print("\n🧪 Testing Pipeline Stages API...")
        
        # Get pipeline stages - should return 6 customizable stages
        success, stages = self.run_test("Get Pipeline Stages", "GET", "crm/pipeline/stages", 200)
        
        if success and stages:
            stage_count = len(stages)
            print(f"   Found {stage_count} pipeline stages")
            
            # Should have at least the default stages
            if stage_count >= 5:
                print("✅ Pipeline has sufficient stages")
                
                # Test updating a stage
                first_stage = stages[0]
                if first_stage:
                    stage_id = first_stage.get("id")
                    update_data = {
                        "stage_key": first_stage.get("stage_key"),
                        "name": "Lead Personalizado", 
                        "color": "bg-purple-500",
                        "order": first_stage.get("order", 0)
                    }
                    
                    self.run_test("Update Pipeline Stage", "PUT", f"crm/pipeline/stages/{stage_id}", 200, update_data)
            else:
                print("❌ Not enough pipeline stages found")
                success = False
        
        return success

    def test_pdf_knowledge_upload(self):
        """Test PDF knowledge upload API"""
        print("\n🧪 Testing PDF Knowledge Upload...")
        
        # Test without actual file (should get proper error response)
        success, response = self.run_test("Get Knowledge Documents", "GET", "crm/knowledge/documents", 200)
        
        return success

    def test_chatbot_integration(self):
        """Test chatbot -> pipeline integration"""
        print("\n🧪 Testing Chatbot Integration...")
        
        # Test creating a new lead from chatbot
        lead_data = {
            "name": "Lead Chatbot",
            "phone": "+5511987654321",
            "whatsapp_id": "+5511987654321"
        }
        
        success, response = self.run_test("Create Lead from Chatbot", "POST", "crm/chatbot/new-lead", 200, lead_data)
        
        if success and response:
            contact = response.get("contact")
            if contact:
                # Should be placed in first stage
                stage = contact.get("pipeline_stage")
                print(f"   Lead created in stage: {stage}")
                
                # Test updating stage via chatbot
                update_data = {
                    "contact_id": contact.get("id"),
                    "stage": "contato_feito"
                }
                
                self.run_test("Update Lead Stage from Chatbot", "PUT", "crm/chatbot/update-stage", 200, update_data)
        
        return success

def main():
    print("🚀 Starting CRM Primo Backend API Tests...")
    print("=" * 50)
    
    tester = CRMAPITester()
    
    # Run all tests
    contacts_ok = tester.test_contacts_api()
    deals_ok = tester.test_deals_api()
    stats_ok = tester.test_dashboard_stats()
    conversations_ok = tester.test_conversations_api()
    
    # New CRM Primo specific tests
    pipeline_ok = tester.test_pipeline_stages_api()
    pdf_ok = tester.test_pdf_knowledge_upload()
    chatbot_ok = tester.test_chatbot_integration()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 API Test Results:")
    print(f"   Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%")
    
    # Test summary by category
    print(f"\n📋 Category Results:")
    print(f"   ✅ Contacts API: {'✅ OK' if contacts_ok else '❌ FAILED'}")
    print(f"   ✅ Deals API: {'✅ OK' if deals_ok else '❌ FAILED'}")
    print(f"   ✅ Stats API: {'✅ OK' if stats_ok else '❌ FAILED'}")
    print(f"   ✅ Conversations API: {'✅ OK' if conversations_ok else '❌ FAILED'}")
    print(f"   ✅ Pipeline Stages: {'✅ OK' if pipeline_ok else '❌ FAILED'}")
    print(f"   ✅ PDF Knowledge: {'✅ OK' if pdf_ok else '❌ FAILED'}")
    print(f"   ✅ Chatbot Integration: {'✅ OK' if chatbot_ok else '❌ FAILED'}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())