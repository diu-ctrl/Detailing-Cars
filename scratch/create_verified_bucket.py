import urllib.request
import urllib.parse
import json
import time
import re

def main():
    print("Step 1: Generating temporary email on 1secmail...")
    # Get domain list
    domains_url = "https://www.1secmail.com/api/v1/?action=getDomainList"
    req_domains = urllib.request.Request(domains_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_domains) as response:
        domains = json.loads(response.read().decode())
    
    domain = domains[0]
    username = f"dc_detailing_{int(time.time())}"
    email = f"{username}@{domain}"
    print(f"Temporary Email Created: {email}")

    print("\nStep 2: Creating bucket on kvdb.io...")
    create_url = "https://kvdb.io/"
    post_data = urllib.parse.urlencode({"email": email}).encode()
    req = urllib.request.Request(create_url, data=post_data, headers={"User-Agent": "Mozilla/5.0"})
    
    try:
        with urllib.request.urlopen(req) as response:
            bucket_id = response.read().decode().strip()
            print(f"Bucket created successfully. ID: {bucket_id}")
    except Exception as e:
        print(f"Error creating bucket on kvdb.io: {e}")
        return

    print("\nStep 3: Waiting for verification email from kvdb.io (polling 1secmail)...")
    inbox_url = f"https://www.1secmail.com/api/v1/?action=getMessages&login={username}&domain={domain}"
    req_inbox = urllib.request.Request(inbox_url, headers={"User-Agent": "Mozilla/5.0"})
    
    verification_link = None
    for attempt in range(12): # Poll for 60 seconds
        print(f"Checking inbox (attempt {attempt+1}/12)...")
        try:
            with urllib.request.urlopen(req_inbox) as response:
                messages = json.loads(response.read().decode())
            
            for msg in messages:
                if "kvdb.io" in msg["from"].lower() or "verify" in msg["subject"].lower():
                    print("Found email from kvdb.io! Fetching content...")
                    msg_id = msg["id"]
                    msg_url = f"https://www.1secmail.com/api/v1/?action=readMessage&login={username}&domain={domain}&id={msg_id}"
                    req_msg = urllib.request.Request(msg_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req_msg) as msg_res:
                        msg_data = json.loads(msg_res.read().decode())
                    
                    body = msg_data["body"]
                    # Extract verification link (match https://kvdb.io/activate/...)
                    links = re.findall(r'https://kvdb.io/activate/[a-zA-Z0-9/]+', body)
                    if links:
                        verification_link = links[0]
                        print(f"Found verification link: {verification_link}")
                        break
            
            if verification_link:
                break
        except Exception as e:
            print(f"Error checking email: {e}")
        time.sleep(5)
    
    if not verification_link:
        print("Failed to receive verification link within 60 seconds.")
        return

    print("\nStep 4: Activating bucket via verification link...")
    try:
        # Add a custom User-Agent to avoid forbidden responses
        req_verify = urllib.request.Request(verification_link, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req_verify) as response:
            result = response.read().decode()
            print("Activation request sent!")
            print("Response preview:", result[:200])
            print(f"\n🎉 SUCCESS! Your verified KVdb.io bucket is ready: {bucket_id}")
            print(f"Read/Write URL: https://kvdb.io/{bucket_id}/appointments")
    except Exception as e:
        print(f"Error activating bucket: {e}")

if __name__ == "__main__":
    main()
