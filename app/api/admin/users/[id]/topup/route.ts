import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const mockUsers = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin' as const,
    status: 'active' as const,
    created_at: '2024-01-15T10:30:00Z',
    last_login: '2024-01-20T14:22:00Z',
    company: 'Acme Corporation',
    permissions: ['read', 'write', 'admin', 'impersonate'],
    balance: 0,
    currency: 'USD'
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user' as const,
    status: 'active' as const,
    created_at: '2024-01-16T09:15:00Z',
    last_login: '2024-01-20T13:45:00Z',
    company: 'Tech Solutions Inc',
    permissions: ['read', 'write'],
    balance: 250.75,
    currency: 'USD',
    project_id: 'proj_1'
  },
  {
    id: 'user_3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'user' as const,
    status: 'active' as const,
    created_at: '2024-01-17T11:20:00Z',
    last_login: '2024-01-20T12:30:00Z',
    company: 'Marketing Agency',
    permissions: ['read', 'write'],
    balance: 89.50,
    currency: 'USD',
    project_id: 'proj_2'
  },
  {
    id: 'user_4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'user' as const,
    status: 'inactive' as const,
    created_at: '2024-01-18T16:45:00Z',
    last_login: '2024-01-19T10:15:00Z',
    company: 'E-commerce Store',
    permissions: ['read'],
    balance: 0,
    currency: 'USD',
    project_id: 'proj_3'
  },
  {
    id: 'user_5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'user' as const,
    status: 'suspended' as const,
    created_at: '2024-01-19T08:30:00Z',
    last_login: '2024-01-19T15:20:00Z',
    company: 'Startup Inc',
    permissions: ['read'],
    balance: 15.25,
    currency: 'USD',
    project_id: 'proj_4'
  }
];

function hasAdminPermissions(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader?.includes('Bearer') || false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasAdminPermissions(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({
        message: 'Content-Type must be application/json'
      }, { status: 400 });
    }

    // Get the raw text first to check if body exists
    const rawBody = await request.text();
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json({
        message: 'Request body is required'
      }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({
        message: 'Invalid JSON format in request body'
      }, { status: 400 });
    }

    const { amount } = body;

    if (amount === undefined || amount === null) {
      return NextResponse.json({
        message: 'Amount is required'
      }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({
        message: 'Amount must be a valid number greater than 0'
      }, { status: 400 });
    }

    const user = mockUsers[userIndex];
    const newBalance = (user.balance || 0) + numericAmount;
    mockUsers[userIndex] = { ...user, balance: newBalance };

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    return NextResponse.json({
      balance: newBalance,
      transaction_id: transactionId,
      amount: numericAmount,
      user_id: id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Failed to topup user credit:", error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
