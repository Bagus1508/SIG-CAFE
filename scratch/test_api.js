async function test() {
    const query = 'coffee';
    const lat = -7.2575;
    const lng = 112.7521;
    const url = `http://localhost:3000/api/cafes?query=${query}&lat=${lat}&lng=${lng}`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error('Response not OK', res.status);
            const text = await res.text();
            console.error(text);
            return;
        }
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

test();
