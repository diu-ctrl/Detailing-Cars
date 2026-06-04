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
  const bucketId = (await createRes.text()).trim();
  console.log(`Bucket Created! ID: ${bucketId}`);

  console.log("Step 3: Polling for email...");
  for (let i = 0; i < 15; i++) {
    const inbox = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid}`)
      .then(r => r.json());
    
    const mails = inbox.list || [];
    for (const mail of mails) {
      if (mail.mail_from.toLowerCase().includes('kvdb') || mail.mail_subject.toLowerCase().includes('verify')) {
        console.log(`Found Welcome Email! Subject: ${mail.mail_subject}`);
        const mailDetail = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mail.mail_id}&sid_token=${sid}`)
          .then(r => r.json());
        
        console.log("Raw Mail Body:");
        console.log(mailDetail.mail_body);
        return;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}
main().catch(console.error);
