import { http, HttpResponse } from 'msw';

// Sample mock data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// Define handlers for mocking API endpoints
export const handlers = [
  // GET /api/users
  http.get('/api/users', () => {
    return HttpResponse.json(users);
  }),
  
  // GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = users.find(user => user.id === Number(id));
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(user);
  }),
  
  // POST /api/users
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    
    // Simulate validation
    if (!newUser.name || !newUser.email) {
      return new HttpResponse(
        JSON.stringify({ error: 'Name and email are required' }), 
        { status: 400 }
      );
    }
    
    // Simulate created response
    return HttpResponse.json(
      { ...newUser, id: Math.floor(Math.random() * 1000) },
      { status: 201 }
    );
  }),
]; 