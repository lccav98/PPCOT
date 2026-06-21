const fs = require('fs');

async function test() {
  const FormData = require('form-data');
  const fetch = require('node-fetch'); // Next.js fetch polyfill is fine, we use local fetch here or require

  const form = new FormData();
  form.append('file', Buffer.from('%PDF-1.4 dummy content'), {
    filename: 'test.pdf',
    contentType: 'application/pdf',
  });

  try {
    const res = await fetch('http://localhost:3000/api/parse', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    const json = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response JSON:', json);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

// Check if node-fetch and form-data are installed or just run a standard dynamic import / require
test();
