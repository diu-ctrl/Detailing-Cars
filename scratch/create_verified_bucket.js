const fs = require('fs');

async function main() {
  console.log("Step 1: Fetching email from Guerrilla Mail...");
  const emailRes = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address')
    .then(r => r.json());
  
  const email = emailRes.email_addr;
  const sid = emailRes.sid_token;
  console.log(`Generated Email: ${email}`);

  console.log("Step 2: Creating bucket on kvdb.io...");
  const createRes = await fetch('https://kvdb.io/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${encodeURIComponent(email)}`
  });
  
  if (!createRes.ok) {
    throw new Error(`Failed to create bucket: ${createRes.statusText}`);
  }
  const bucketId = (await createRes.text()).trim();
  console.log(`Bucket Created! ID: ${bucketId}`);

  console.log("Step 3: Polling Guerrilla Mail for verification email...");
  let activationLink = null;
  for (let i = 0; i < 20; i++) {
    console.log(`Checking inbox (attempt ${i + 1}/20)...`);
    const inbox = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid}`)
      .then(r => r.json());
    
    const mails = inbox.list || [];
    for (const mail of mails) {
      if (mail.mail_from.toLowerCase().includes('kvdb') || mail.mail_subject.toLowerCase().includes('verify')) {
        console.log(`Found verification email: ${mail.mail_subject}`);
        const mailDetail = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mail.mail_id}&sid_token=${sid}`)
          .then(r => r.json());
        
        const body = mailDetail.mail_body;
        const match = body.match(/https:\/\/kvdb\.io\/login\?token=[a-zA-Z0-9_.-]+/);
        if (match) {
          activationLink = match[0];
          break;
        }
      }
    }
    if (activationLink) break;
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (!activationLink) {
    throw new Error("Verification email not found after polling.");
  }

  console.log(`Step 4: Activating bucket via ${activationLink}...`);
  const activateRes = await fetch(activationLink, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log(`Activation Response Status: ${activateRes.status}`);
  console.log(`\n🎉 SUCCESS! Your verified KVdb.io bucket is ready: ${bucketId}`);
  console.log(`Read/Write URL: https://kvdb.io/${bucketId}/appointments`);
}

main().catch(console.error);
