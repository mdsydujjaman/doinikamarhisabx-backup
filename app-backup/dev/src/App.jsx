const BASE_URL = import.meta.env.BASE_URL;
const ROOT_URL = 'https://mdsydujjaman.github.io/doinikamarhisab-X/';

const features = [
  { title: 'খরচ যোগ', color: '#3b82f6' },
  { title: 'আয় যোগ', color: '#22c55e' },
  { title: 'বাকি খাতা', color: '#a855f7' },
  { title: 'রিপোর্ট', color: '#f59e0b' },
];

export default function App() {
  const balance = 12500;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0A1931,#102b50,#071426)',
      padding: 18,
      fontFamily: 'system-ui,"Noto Sans Bengali",sans-serif',
      color: '#fff'
    }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 22
        }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>
              দৈনিক আমার হিসাবX
            </div>
            <div style={{ fontSize: 12, opacity: .7 }}>
              আপনার সব হিসাব, এক অ্যাপ
            </div>
          </div>
          <span style={{
            background: '#f59e0b',
            color: '#111827',
            padding: '7px 11px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800
          }}>
            BACKUP PREVIEW
          </span>
        </header>

        <nav style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20
        }}>
          <a href={ROOT_URL} target="_blank" rel="noopener noreferrer"
            style={navStyle}>
            ROOT LIVE ↗
          </a>
          <a href={BASE_URL} style={{
            ...navStyle,
            background: '#f59e0b',
            color: '#172033'
          }}>
            BACKUP LIVE
          </a>
        </nav>

        <section style={{
          background: 'linear-gradient(145deg,#fff,#dce8f5)',
          borderRadius: 24,
          padding: 24,
          color: '#0f172a',
          boxShadow: '0 18px 38px #0007',
          marginBottom: 20
        }}>
          <p style={{ margin: 0, color: '#475569' }}>
            মোট ব্যালেন্স
          </p>
          <h1 style={{ fontSize: 36, margin: '8px 0' }}>
            ৳ {balance.toLocaleString('bn-BD')}
          </h1>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 16
          }}>
            <div style={{
              background: '#0f766e',
              color: '#fff',
              padding: 13,
              borderRadius: 12,
              textAlign: 'center'
            }}>
              আয়
              <strong style={{ display: 'block', marginTop: 5 }}>৳ ৫,০০০</strong>
            </div>
            <div style={{
              background: '#dc2626',
              color: '#fff',
              padding: 13,
              borderRadius: 12,
              textAlign: 'center'
            }}>
              ব্যয়
              <strong style={{ display: 'block', marginTop: 5 }}>৳ ১,২০০</strong>
            </div>
          </div>
          <p style={{
            fontSize: 11,
            color: '#64748b',
            marginBottom: 0
          }}>
            এগুলো শুধু নমুনা তথ্য; বাস্তব লেনদেন নয়।
          </p>
        </section>

        <h3 style={{ margin: '0 0 12px' }}>হিসাবের ফিচার</h3>

        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12
        }}>
          {features.map((item) => (
            <div key={item.title} style={{
              padding: 19,
              borderRadius: 18,
              background: item.color,
              textAlign: 'center',
              fontWeight: 800,
              boxShadow: '0 8px 18px #0005'
            }}>
              {item.title}
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                marginTop: 8,
                opacity: .9
              }}>
                পরবর্তী ধাপে চালু হবে
              </div>
            </div>
          ))}
        </section>

        <section style={{
          marginTop: 22,
          padding: 15,
          border: '1px solid #f59e0b',
          borderRadius: 14,
          background: '#f59e0b15',
          color: '#fde68a',
          fontSize: 13,
          lineHeight: 1.8
        }}>
          <strong>প্রিভিউ নোট:</strong>
          <br />
          এটি বর্তমানে UI Preview। আয়-ব্যয় সংরক্ষণ, লগইন,
          রিপোর্ট এবং ডাটাবেসের কার্যক্রম এখনো চালু হয়নি।
        </section>

        <a href={`${BASE_URL}foundation/`} style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 22,
          padding: 14,
          borderRadius: 14,
          background: '#185ADB',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 700
        }}>
          পুরোনো STEP 00 FOUNDATION পেজ দেখুন ↗
        </a>

        <footer style={{
          textAlign: 'center',
          marginTop: 22,
          paddingBottom: 15,
          opacity: .65,
          fontSize: 11,
          lineHeight: 1.8
        }}>
          দৈনিক আমার হিসাবX
          <br />
          BACKUP TESTING ENVIRONMENT
          <br />
          ROOT LIVE আলাদা ও সুরক্ষিত
        </footer>

      </div>
    </main>
  );
}

const navStyle = {
  display: 'block',
  textAlign: 'center',
  padding: 13,
  borderRadius: 13,
  background: '#185ADB',
  color: '#fff',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 800
};
