# WhatsApp Sohbet Analizi

Bu proje, WhatsApp sohbet dışa aktarım dosyalarını analiz eden bir web uygulamasıdır. Kullanıcılar, WhatsApp sohbet geçmişi dosyasını (.txt) yükleyerek grup içindeki mesajlaşma istatistiklerini görüntüleyebilir.

## Özellikler

- Sürükle-bırak dosya yükleme
- Kişi bazlı mesaj istatistikleri
- Mesaj sayısı ve yüzdelik dağılımlar
- Zaman bazlı filtreleme (son 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl)
- Çoktan aza / azdan çoğa sıralama
- Koyu tema tasarım
- Mobil uyumlu arayüz

## Teknolojiler

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hooks

## Kurulum

1. Projeyi klonlayın:
\`\`\`bash
git clone [repo-url]
cd whatsapp-analiz
\`\`\`

2. Bağımlılıkları yükleyin:
\`\`\`bash
npm install
\`\`\`

3. Geliştirme sunucusunu başlatın:
\`\`\`bash
npm run dev
\`\`\`

4. Tarayıcınızda http://localhost:3000 adresini açın

## Kullanım

1. WhatsApp sohbetinizi dışa aktarın (medya olmadan)
2. Oluşturulan .txt dosyasını web sitesine sürükleyip bırakın veya dosya seçiciyi kullanarak yükleyin
3. İstatistikleri görüntüleyin ve filtreleri kullanarak analiz edin

## Lisans

MIT
