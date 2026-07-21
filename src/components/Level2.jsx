// src/components/Level2.jsx
import React, { useState } from 'react';

export const vocabData = {
    greetings: [
      { j: 'こんにちは', r: 'Konnichiwa', e: 'Hello / Good afternoon', file: 'hello.mp3' },
      { j: 'おはようございます', r: 'Ohayō gozaimasu', e: 'Good morning', file: 'goodmorning.mp3' },
      { j: 'こんばんは', r: 'Konbanwa', e: 'Good evening', file: 'goodevening.mp3' },
      { j: 'おやすみなさい', r: 'Oyasuminasai', e: 'Good night', file: 'goodnight.mp3' },
      { j: 'さようなら', r: 'Sayōnara', e: 'Goodbye', file: 'goodbye.mp3' },
      { j: 'ありがとう', r: 'Arigatō', e: 'Thank you', file: 'thankyou.mp3' },
      { j: 'どういたしまして', r: 'Dōitashimashite', e: 'You are welcome', file: 'yourewelcome.mp3' },
      { j: 'すみません', r: 'Sumimasen', e: 'Excuse me / I am sorry', file: 'excuseme.mp3' },
      { j: 'ごめんなさい', r: 'Gomen nasai', e: 'I am sorry', file: 'imsorry.mp3' },
      { j: 'はい', r: 'Hai', e: 'Yes', file: 'yes.mp3' },
      { j: 'いいえ', r: 'Iie', e: 'No', file: 'no.mp3' },
      { j: 'おねがいします', r: 'Onegaishimasu', e: 'Please', file: 'please.mp3' },
      { j: 'はじめまして', r: 'Hajimemashite', e: 'Nice to meet you', file: 'nicetomeetyou.mp3' },
      { j: 'おげんきですか', r: 'Ogenki desu ka', e: 'How are you?', file: 'howareyou.mp3' },
      { j: 'げんきです', r: 'Genki desu', e: 'I am fine', file: 'iamfine.mp3' },
      { j: 'おひさしぶりです', r: 'Ohisashiburi desu', e: 'Long time no see', file: 'longtime.mp3' },
      { j: 'がんばって', r: 'Ganbatte', e: 'Good luck / Do your best', file: 'goodluck.mp3' },
      { j: 'おめでとう', r: 'Omedetō', e: 'Congratulations', file: 'congrats.mp3' },
      { j: 'ようこそ', r: 'Yōkoso', e: 'Welcome', file: 'welcome.mp3' },
      { j: 'いってきます', r: 'Ittekimasu', e: 'I am leaving', file: 'leaving.mp3' },
      { j: 'いってらっしゃい', r: 'Itterasshai', e: 'Have a good trip', file: 'goodtrip.mp3' },
      { j: 'ただいま', r: 'Tadaima', e: 'I am home', file: 'imhome.mp3' },
      { j: 'おかえりなさい', r: 'Okaerinasai', e: 'Welcome back', file: 'welcomeback.mp3' },
      { j: 'いただきます', r: 'Itadakimasu', e: 'Let us eat', file: 'letseat.mp3' },
      { j: 'ごちそうさまでした', r: 'Gochisōsama deshita', e: 'Thank you for the meal', file: 'thanksmeal.mp3' }
    ],
    food: [
      { j: 'みず', r: 'Mizu', e: 'Water', file: 'water.mp3' },
      { j: 'おちゃ', r: 'Ocha', e: 'Tea', file: 'tea.mp3' },
      { j: 'ごはん', r: 'Gohan', e: 'Rice / Meal', file: 'rice.mp3' },
      { j: 'ぱん', r: 'Pan', e: 'Bread', file: 'bread.mp3' },
      { j: 'にく', r: 'Niku', e: 'Meat', file: 'meat.mp3' },
      { j: 'さかな', r: 'Sakana', e: 'Fish', file: 'fish.mp3' },
      { j: 'たまご', r: 'Tamago', e: 'Egg', file: 'egg.mp3' },
      { j: 'やさい', r: 'Yasai', e: 'Vegetables', file: 'vegetables.mp3' },
      { j: 'くだもの', r: 'Kudamono', e: 'Fruit', file: 'fruit.mp3' },
      { j: 'りんご', r: 'Ringo', e: 'Apple', file: 'apple.mp3' },
      { j: 'すし', r: 'Sushi', e: 'Sushi', file: 'sushi.mp3' },
      { j: 'らーめん', r: 'Ramen', e: 'Ramen', file: 'ramen.mp3' },
      { j: 'ぎゅうにゅう', r: 'Gyūnyū', e: 'Milk', file: 'milk.mp3' },
      { j: 'こーひー', r: 'Kōhī', e: 'Coffee', file: 'coffee.mp3' },
      { j: 'ぶたにく', r: 'Butaniku', e: 'Pork', file: 'pork.mp3' },
      { j: 'ぎゅうにく', r: 'Gyūniku', e: 'Beef', file: 'beef.mp3' },
      { j: 'とりにく', r: 'Toriniku', e: 'Chicken', file: 'chicken.mp3' },
      { j: 'さとう', r: 'Satō', e: 'Sugar', file: 'sugar.mp3' },
      { j: 'しお', r: 'Shio', e: 'Salt', file: 'salt.mp3' },
      { j: 'しょうゆ', r: 'Shōyu', e: 'Soy Sauce', file: 'soysauce.mp3' },
      { j: 'あさごはん', r: 'Asagohan', e: 'Breakfast', file: 'breakfast.mp3' },
      { j: 'ひるごはん', r: 'Hirugohan', e: 'Lunch', file: 'lunch.mp3' },
      { j: 'ばんごはん', r: 'Bangohan', e: 'Dinner', file: 'dinner.mp3' },
      { j: 'おかし', r: 'Okashi', e: 'Snack / Sweets', file: 'snack.mp3' },
      { j: 'はし', r: 'Hashi', e: 'Chopsticks', file: 'chopsticks.mp3' }
    ],
    travel: [
      { j: 'えき', r: 'Eki', e: 'Station', file: 'station.mp3' },
      { j: 'でんしゃ', r: 'Densha', e: 'Train', file: 'train.mp3' },
      { j: 'ばす', r: 'Basu', e: 'Bus', file: 'bus.mp3' },
      { j: 'くうこう', r: 'Kūkō', e: 'Airport', file: 'airport.mp3' },
      { j: 'ひこうき', r: 'Hikōki', e: 'Airplane', file: 'airplane.mp3' },
      { j: 'たくしー', r: 'Takushī', e: 'Taxi', file: 'taxi.mp3' },
      { j: 'きっぷ', r: 'Kippu', e: 'Ticket', file: 'ticket.mp3' },
      { j: 'ほてる', r: 'Hoteru', e: 'Hotel', file: 'hotel.mp3' },
      { j: 'ぱすぽーと', r: 'Pasupōto', e: 'Passport', file: 'passport.mp3' },
      { j: 'ちず', r: 'Chizu', e: 'Map', file: 'map.mp3' },
      { j: 'にもつ', r: 'Nimotsu', e: 'Luggage', file: 'luggage.mp3' },
      { j: 'といれ', r: 'Toire', e: 'Restroom', file: 'restroom.mp3' },
      { j: 'みぎ', r: 'Migi', e: 'Right', file: 'right.mp3' },
      { j: 'ひだり', r: 'Hidari', e: 'Left', file: 'left.mp3' },
      { j: 'まっすぐ', r: 'Massugu', e: 'Straight', file: 'straight.mp3' },
      { j: 'ちかく', r: 'Chikaku', e: 'Near', file: 'near.mp3' },
      { j: 'とおく', r: 'Tōku', e: 'Far', file: 'far.mp3' },
      { j: 'ぎんこう', r: 'Ginkō', e: 'Bank', file: 'bank.mp3' },
      { j: 'びょういん', r: 'Byōin', e: 'Hospital', file: 'hospital.mp3' },
      { j: 'けいさつ', r: 'Keisatsu', e: 'Police', file: 'police.mp3' },
      { j: 'こんびに', r: 'Konbini', e: 'Convenience Store', file: 'convenience.mp3' },
      { j: 'れすとらん', r: 'Resutoran', e: 'Restaurant', file: 'restaurant.mp3' },
      { j: 'おかね', r: 'Okane', e: 'Money', file: 'money.mp3' },
      { j: 'くれじっとかーど', r: 'Kurejitto kādo', e: 'Credit Card', file: 'creditcard.mp3' },
      { j: 'よやく', r: 'Yoyaku', e: 'Reservation', file: 'reservation.mp3' }
    ],
    verbs: [
      { j: 'たべる', r: 'Taberu', e: 'To eat', file: 'eat.mp3' },
      { j: 'のむ', r: 'Nomu', e: 'To drink', file: 'drink.mp3' },
      { j: 'いく', r: 'Iku', e: 'To go', file: 'go.mp3' },
      { j: 'くる', r: 'Kuru', e: 'To come', file: 'come.mp3' },
      { j: 'よむ', r: 'Yomu', e: 'To read', file: 'read.mp3' },
      { j: 'かく', r: 'Kaku', e: 'To write', file: 'write.mp3' },
      { j: 'はなす', r: 'Hanasu', e: 'To speak', file: 'speak.mp3' },
      { j: 'きく', r: 'Kiku', e: 'To listen / To ask', file: 'listen.mp3' },
      { j: 'みる', r: 'Miru', e: 'To see / To watch', file: 'see.mp3' },
      { j: 'かう', r: 'Kau', e: 'To buy', file: 'buy.mp3' },
      { j: 'ねる', r: 'Neru', e: 'To sleep', file: 'sleep.mp3' },
      { j: 'おきる', r: 'Okiru', e: 'To wake up', file: 'wakeup.mp3' },
      { j: 'あるく', r: 'Aruku', e: 'To walk', file: 'walk.mp3' },
      { j: 'はしる', r: 'Hashiru', e: 'To run', file: 'run.mp3' },
      { j: 'およぐ', r: 'Oyogu', e: 'To swim', file: 'swim.mp3' },
      { j: 'つくる', r: 'Tsukuru', e: 'To make', file: 'make.mp3' },
      { j: 'まつ', r: 'Matsu', e: 'To wait', file: 'wait.mp3' },
      { j: 'つかう', r: 'Tsukau', e: 'To use', file: 'use.mp3' },
      { j: 'はたらく', r: 'Hataraku', e: 'To work', file: 'work.mp3' },
      { j: 'やすむ', r: 'Yasumu', e: 'To rest', file: 'rest.mp3' },
      { j: 'べんきょうする', r: 'Benkyō suru', e: 'To study', file: 'study.mp3' },
      { j: 'あそぶ', r: 'Asobu', e: 'To play', file: 'play.mp3' },
      { j: 'あげる', r: 'Ageru', e: 'To give', file: 'give.mp3' },
      { j: 'もらう', r: 'Morau', e: 'To receive', file: 'receive.mp3' },
      { j: 'わかる', r: 'Wakaru', e: 'To understand', file: 'understand.mp3' }
    ]
  };


export default function Level2({ navigateTo, setQuizMode }) {
  const [activeTab, setActiveTab] = useState('greetings');

  const playAudio = (filename) => {
    const audio = new Audio(`/assets/audio/level_two/${filename}`);
    audio.play().catch(() => console.warn(`Audio target track asset configuration lost: ${filename}`));
  };
 
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn" style={{ marginBottom: '20px', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => navigateTo('learn')}>← Back to Curriculum</button>
      
      <div className="settings-section">
        <h2 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Level 2: Vocabulary Dictionary 📖</h2>
        <p style={{ color: 'var(--text-muted)' }}>Expand your everyday lexicon with these essential categories.</p>
      </div>

      {/* CATEGORY TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        {Object.keys(vocabData).map(category => (
          <button 
            key={category} 
            className={`btn ${activeTab === category ? 'btn-primary' : ''}`} 
            style={{ borderRadius: '20px', textTransform: 'capitalize' }} 
            onClick={() => setActiveTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* VOCABULARY GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {(vocabData[activeTab] || []).map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '20px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{item.j}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{item.r}</div>
              <div style={{ color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.95rem' }}>{item.e}</div>
            </div>
            
            <button 
              className="btn" 
              style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                color: 'var(--accent-color)', 
                borderRadius: '50%', 
                width: '45px', 
                height: '45px', 
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                flexShrink: 0
              }} 
              onClick={() => playAudio(item.file)}
            >
              🔊
            </button>
          </div>
        ))}
      </div>

      {/* ASSESSMENT LINK */}
      <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Ready to test your Vocabulary knowledge?</h3>
        <button 
          className="btn btn-primary" 
          style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }} 
          onClick={() => { setQuizMode('level2'); navigateTo('assessment'); }}
        >
          📝 Take Level 2 Assessment
        </button>
      </div>
    </div>
  );
}