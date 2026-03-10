import "./App.css";

export default function AboutPage() {
  return (
    <main className="pantry-page">
        <section className="pantry-card" style={{ textAlign: 'left' }}>
            <p className="eyebrow">About Us</p>
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right' }} />
            <h1>About BetterCook</h1> 
            <p className="subtitle" style={{ marginTop: '1rem' }}>
              Created to assist the most beginner of cooks
              without the need to worry.
            </p>
            <div style={{ marginTop: '2rem', color: 'var(--ink)' }}>
            <p>
              We built BetterCook for the home cook who stares into the fridge
              wondering what to make, the beginner who's a little intimidated 
              by a recipe, and the busy parent who just wants something delicious
              on the table tonight. Our assistant is here to guide you step by 
              step by suggesting recipes based on what you have and helping you 
              grow your skills one meal at a time.
            </p>
            </div>
        </section>
    </main>
  );
}