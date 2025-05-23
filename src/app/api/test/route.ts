import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Test API route called');
  return NextResponse.json({ success: true, message: 'Test API route works!' });
}

export async function POST(request: NextRequest) {
  console.log('Test API POST route called');
  
  try {
    const body = await request.json();
    console.log('Received data:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test API POST route works!',
      receivedData: body
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing request',
      error: String(error)
    }, { status: 500 });
  }
}
