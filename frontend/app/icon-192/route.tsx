import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#2563EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 112, fontWeight: 700,
      }}>
        +
      </div>
    ),
    size
  )
}
