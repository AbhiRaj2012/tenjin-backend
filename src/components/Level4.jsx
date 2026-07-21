// src/components/Level4.jsx
import React, { useState } from 'react';

export default function Level4({ navigateTo, setQuizMode }) {
  const [activeTab, setActiveTab] = useState('travel');
  const [revealed, setRevealed] = useState({});

  const playAudio = (filename) => {
    const audio = new Audio(`/assets/audio/level_four/${filename}`);
    audio.play().catch(() => console.warn(`Audio track missing: ${filename}`));
  };

  const sentenceData = {
       travel: [
                { j: '東京駅はどこですか？', h: 'とうきょうえきは どこですか？', r: 'Tōkyō eki wa doko desu ka?', e: 'Where is Tokyo station?', file: 'where_tokyo_station.mp3' },
                { j: '切符を一枚お願いします。', h: 'きっぷを いちまい おねがいします。', r: 'Kippu o ichimai onegaishimasu.', e: 'One ticket, please.', file: 'one_ticket.mp3' },
                { j: 'この電車は新宿に行きますか？', h: 'この でんしゃは しんじゅくに いきますか？', r: 'Kono densha wa Shinjuku ni ikimasu ka?', e: 'Does this train go to Shinjuku?', file: 'train_to_shinjuku.mp3' },
                { j: 'まっすぐ行ってください。', h: 'まっすぐ いってください。', r: 'Massugu itte kudasai.', e: 'Please go straight ahead.', file: 'go_straight.mp3' },
                { j: '次の駅で降ります。', h: 'つぎの えきで おります。', r: 'Tsugi no eki de orimasu.', e: 'I will get off at the next station.', file: 'next_station.mp3' },
                { j: 'バス停はどこですか？', h: 'バスていは どこですか？', r: 'Basutei wa doko desu ka?', e: 'Where is the bus stop?', file: 'where_bus_stop.mp3' },
                { j: '地図を書いてもらえますか？', h: 'ちずを かいて もらえますか？', r: 'Chizu o kaite moraemasu ka?', e: 'Could you draw me a map?', file: 'draw_map.mp3' },
                { j: 'ホテルに荷物を預けたいです。', h: 'ホテルに にもつを あずけたいです。', r: 'Hoteru ni nimotsu o azuketai desu.', e: 'I want to leave my luggage at the hotel.', file: 'leave_luggage.mp3' },
                { j: '歩いて行けますか？', h: 'あるいて いけますか？', r: 'Aruite ikemasu ka?', e: 'Can I go there on foot?', file: 'go_on_foot.mp3' },
                { j: 'タクシーを呼んでください。', h: 'タクシーを よんでください。', r: 'Takushī o yonde kudasai.', e: 'Please call a taxi.', file: 'call_taxi.mp3' }
            ],
            shopping: [
                { j: 'これはいくらですか？', h: 'これは いくらですか？', r: 'Kore wa ikura desu ka?', e: 'How much is this?', file: 'how_much.mp3' },
                { j: 'クレジットカードは使えますか？', h: 'クレジットカードは つかえますか？', r: 'Kurejitto kādo wa tsukaemasu ka?', e: 'Can I use a credit card?', file: 'credit_card.mp3' },
                { j: 'これをください。', h: 'これを ください。', r: 'Kore o kudasai.', e: 'I will take this. / This one, please.', file: 'ill_take_this.mp3' },
                { j: 'メニューをお願いします。', h: 'メニューを おねがいします。', r: 'Menyū o onegaishimasu.', e: 'Menu, please.', file: 'menu_please.mp3' },
                { j: 'おすすめは何ですか？', h: 'おすすめは なんですか？', r: 'Osusume wa nan desu ka?', e: 'What do you recommend?', file: 'what_recommend.mp3' },
                { j: 'お会計をお願いします。', h: 'おかいけいを おねがいします。', r: 'Okaikei o onegaishimasu.', e: 'The bill/check, please.', file: 'bill_please.mp3' },
                { j: 'もう少し安いのはありますか？', h: 'もうすこし やすいのは ありますか？', r: 'Mō sukoshi yasui no wa arimasu ka?', e: 'Do you have a cheaper one?', file: 'cheaper_one.mp3' },
                { j: '試着してもいいですか？', h: 'しちゃくしても いいですか？', r: 'Shichaku shite mo ii desu ka?', e: 'Can I try this on?', file: 'try_on.mp3' },
                { j: '水をお願いします。', h: 'みずを おねがいします。', r: 'Mizu o onegaishimasu.', e: 'Water, please.', file: 'water_please.mp3' },
                { j: 'ベジタリアン用のメニューはありますか？', h: 'ベジタリアンようの メニューは ありますか？', r: 'Bejitarian yō no menyū wa arimasu ka?', e: 'Do you have a vegetarian menu?', file: 'vegetarian_menu.mp3' }
            ],
            social: [
                { j: '英語が話せますか？', h: 'えいごが はなせますか？', r: 'Eigo ga hanasemasu ka?', e: 'Can you speak English?', file: 'speak_english.mp3' },
                { j: 'お名前は何ですか？', h: 'おなまえは なんですか？', r: 'Onamae wa nan desu ka?', e: 'What is your name?', file: 'what_is_your_name.mp3' },
                { j: '私はアメリカから来ました。', h: 'わたしは アメリカから きました。', r: 'Watashi wa Amerika kara kimashita.', e: 'I come from America.', file: 'from_america.mp3' },
                { j: '趣味は何ですか？', h: 'しゅみは なんですか？', r: 'Shumi wa nan desu ka?', e: 'What are your hobbies?', file: 'what_hobbies.mp3' },
                { j: 'もう一度言ってください。', h: 'もういちど いってください。', r: 'Mō ichido itte kudasai.', e: 'Please say that one more time.', file: 'say_again.mp3' },
                { j: 'ゆっくり話してください。', h: 'ゆっくり はなしてください。', r: 'Yukkuri hanashite kudasai.', e: 'Please speak slowly.', file: 'speak_slowly.mp3' },
                { j: '日本語が少ししか話せません。', h: 'にほんごが すこししか はなせません。', r: 'Nihongo ga sukoshi shika hanasemasen.', e: 'I can only speak a little Japanese.', file: 'little_japanese.mp3' },
                { j: 'LINEを交換しませんか？', h: 'ラインを こうかんしませんか？', r: 'Rain o kōkan shimasen ka?', e: 'Would you like to exchange LINE (contacts)?', file: 'exchange_line.mp3' },
                { j: '週末は何をしますか？', h: 'しゅうまつは なにを しますか？', r: 'Shūmatsu wa nani o shimasu ka?', e: 'What are you doing this weekend?', file: 'weekend_plans.mp3' },
                { j: 'とても美味しいです！', h: 'とても おいしいです！', r: 'Totemo oishii desu!', e: 'It is very delicious!', file: 'very_delicious.mp3' }
            ],
            emergency: [
                { j: '助けて！', h: 'たすけて！', r: 'Tasukete!', e: 'Help!', file: 'help.mp3' },
                { j: '病院はどこですか？', h: 'びょういんは どこですか？', r: 'Byōin wa doko desu ka?', e: 'Where is the hospital?', file: 'where_hospital.mp3' },
                { j: '警察を呼んでください。', h: 'けいさつを よんでください。', r: 'Keisatsu o yonde kudasai.', e: 'Please call the police.', file: 'call_police.mp3' },
                { j: 'パスポートをなくしました。', h: 'パスポートを なくしました。', r: 'Pasupōto o nakushimashita.', e: 'I lost my passport.', file: 'lost_passport.mp3' },
                { j: '気分が悪いです。', h: 'きぶんが わるいです。', r: 'Kibun ga warui desu.', e: 'I feel sick / unwell.', file: 'feel_sick.mp3' },
                { j: '救急車を呼んでください。', h: 'きゅうきゅうしゃを よんでください。', r: 'Kyūkyūsha o yonde kudasai.', e: 'Please call an ambulance.', file: 'call_ambulance.mp3' },
                { j: 'アレルギーがあります。', h: 'アレルギーが あります。', r: 'Arerugī ga arimasu.', e: 'I have an allergy.', file: 'have_allergy.mp3' },
                { j: '痛いです。', h: 'いたいです。', r: 'Itai desu.', e: 'It hurts.', file: 'it_hurts.mp3' },
                { j: '英語が話せる医者はいますか？', h: 'えいごが はなせる いしゃは いますか？', r: 'Eigo ga hanaseru isha wa imasu ka?', e: 'Is there a doctor who speaks English?', file: 'english_doctor.mp3' },
                { j: 'ここはどこですか？', h: 'ここは どこですか？', r: 'Koko wa doko desu ka?', e: 'Where am I?', file: 'where_am_i.mp3' }
            ]
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <button className="btn" style={{ marginBottom: '20px', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => navigateTo('learn')}>← Back to Curriculum</button>
      
      <div className="settings-section">
        <h2 style={{ marginBottom: '15px', color: '#e67e22' }}>Level 4: Common Sentences 🗣️</h2>
        <p style={{ color: 'var(--text-muted)' }}>Deploy your vocabulary within situational syntax structures.</p>
      </div>

      <div className="settings-section">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          {Object.keys(sentenceData).map(category => (
            <button 
              key={category} 
              className={`btn ${activeTab === category ? 'btn-primary' : ''}`} 
              style={{ borderRadius: '20px', textTransform: 'capitalize', background: activeTab === category ? '#e67e22' : 'var(--bg-card)', border: 'none' }} 
              onClick={() => setActiveTab(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {(sentenceData[activeTab] || []).map((item, idx) => (
            <div key={idx} style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>{item.j}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.h}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600 }}>{item.r}</div>
                </div>
                <button 
                  className="btn" 
                  style={{ background: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(230, 126, 34, 0.2)' }} 
                  onClick={() => playAudio(item.file)}
                >
                  🔊
                </button>
              </div>

              {revealed[idx] ? (
                <div style={{ background: 'rgba(230, 126, 34, 0.1)', padding: '12px', borderRadius: '8px', color: '#e67e22', fontWeight: 600, fontSize: '0.95rem' }}>
                  {item.e}
                </div>
              ) : (
                <button 
                  onClick={() => setRevealed(prev => ({ ...prev, [idx]: true }))}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #e67e22', borderRadius: '8px', padding: '10px', color: '#e67e22', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  👁️ Click to reveal meaning
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '12px', background: '#e67e22', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)' }} 
          onClick={() => { setQuizMode('level4'); navigateTo('assessment'); }}
        >
          📝 Take Level 4 Assessment
        </button>
      </div>
    </div>
  );
}