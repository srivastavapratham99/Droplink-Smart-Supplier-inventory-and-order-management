const fs = require('fs');

async function test() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supplier@apex.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status, 'Success:', loginData.success);
  if (!loginData.success) {
    console.log('Login failed:', loginData);
    return;
  }
  const token = loginData.token || loginData.data?.token;

  const fileBytes = fs.readFileSync('test-product.png');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const head = '--' + boundary + '\r\nContent-Disposition: form-data; name="image"; filename="test-product.png"\r\nContent-Type: image/png\r\n\r\n';
  const tail = '\r\n--' + boundary + '--\r\n';

  const payload = Buffer.concat([
    Buffer.from(head, 'utf-8'),
    fileBytes,
    Buffer.from(tail, 'utf-8')
  ]);

  const uploadRes = await fetch('http://localhost:5000/api/products/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + boundary
    },
    body: payload
  });
  const uploadData = await uploadRes.json();
  console.log('Upload status:', uploadRes.status, 'Data:', uploadData);

  if (uploadData.url) {
    const staticRes = await fetch('http://localhost:5000' + uploadData.url);
    const bytes = (await staticRes.arrayBuffer()).byteLength;
    console.log('Static fetch status:', staticRes.status, 'Content-Type:', staticRes.headers.get('content-type'), 'Length:', bytes);

    // Test creating product with this image
    const createRes = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Automated Test Image Headset',
        sku: 'TEST-IMG-' + Date.now().toString().slice(-4),
        category: 'Electronics',
        basePrice: 1999,
        costPrice: 999,
        stock: 45,
        imageUrl: uploadData.url,
        description: 'Product created with uploaded image test'
      })
    });
    const createData = await createRes.json();
    console.log('Create product status:', createRes.status, 'Success:', createData.success);
    console.log('Saved product images:', createData.data?.images);

    // Verify product can be fetched
    if (createData.data?._id) {
      const getRes = await fetch('http://localhost:5000/api/products/' + createData.data._id);
      const getData = await getRes.json();
      console.log('Get product status:', getRes.status, 'Image url:', getData.data?.images?.[0]?.url);

      // Clean up test product
      await fetch('http://localhost:5000/api/products/' + createData.data._id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('Cleaned up test product.');
    }
  }
}
test().catch(console.error);
