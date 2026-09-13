// Script to generate the complete 28-page "Mastering Facebook Ads" PDF
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createMasteringFacebookAdsPDF() {
  const pdfDoc = await PDFDocument.create();

  // Dimensions: 1000 x 750 (4:3 aspect ratio landscape matching screenshots)
  const pageWidth = 1000;
  const pageHeight = 750;

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Color Palette
  const darkBg = rgb(0.09, 0.09, 0.10);       // #17181a
  const cardDark = rgb(0.12, 0.12, 0.14);     // #1f2024
  const creamBg = rgb(0.96, 0.95, 0.92);      // #f5f3ec
  const coral = rgb(0.91, 0.36, 0.26);        // #e85c42
  const textWhite = rgb(1, 1, 1);
  const textDark = rgb(0.12, 0.12, 0.13);     // #1e1e20
  const textMuted = rgb(0.48, 0.48, 0.47);    // #7a7a78
  const borderLight = rgb(0.85, 0.84, 0.80);
  const blueAccent = rgb(0.35, 0.45, 0.85);

  function safeText(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[✓✔]/g, '[x]')
      .replace(/[·•]/g, '-')
      .replace(/[→]/g, '->')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, '-')
      .replace(/[₹]/g, 'Rs. ')
      .replace(/[^\x00-\x7F]/g, '');
  }

  function addStandardHeader(page, category, pageNum) {
    page.drawText('MASTERING FACEBOOK ADS', {
      x: 50,
      y: pageHeight - 40,
      size: 10,
      font: fontHelveticaBold,
      color: textMuted,
    });

    const categoryText = safeText(`${category} / ${pageNum < 10 ? '0' + pageNum : pageNum}`);
    const catWidth = fontHelveticaBold.widthOfTextAtSize(categoryText, 10);
    page.drawText(categoryText, {
      x: pageWidth - 50 - catWidth,
      y: pageHeight - 40,
      size: 10,
      font: fontHelveticaBold,
      color: textMuted,
    });

    page.drawLine({
      start: { x: 50, y: pageHeight - 55 },
      end: { x: pageWidth - 50, y: pageHeight - 55 },
      thickness: 0.5,
      color: borderLight,
    });

    page.drawText('A practical guide to launching conversion-led campaigns', {
      x: 50,
      y: 35,
      size: 9,
      font: fontHelvetica,
      color: textMuted,
    });

    const pageStr = safeText(`${pageNum < 10 ? '0' + pageNum : pageNum} - 28`);
    const pageStrWidth = fontHelvetica.widthOfTextAtSize(pageStr, 9);
    page.drawText(pageStr, {
      x: pageWidth - 50 - pageStrWidth,
      y: 35,
      size: 9,
      font: fontHelvetica,
      color: textMuted,
    });
  }

  // ==========================================
  // PAGE 1: COVER
  // ==========================================
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: darkBg,
    });

    page.drawRectangle({
      x: pageWidth * 0.55,
      y: 0,
      width: pageWidth * 0.45,
      height: pageHeight,
      color: rgb(0.14, 0.15, 0.17),
    });

    page.drawRectangle({
      x: pageWidth * 0.65,
      y: 160,
      width: 220,
      height: 420,
      color: rgb(0.2, 0.22, 0.25),
      borderColor: rgb(0.3, 0.33, 0.38),
      borderWidth: 3,
    });

    page.drawRectangle({
      x: pageWidth * 0.65 + 15,
      y: 175,
      width: 190,
      height: 380,
      color: rgb(0.92, 0.93, 0.95),
    });

    page.drawRectangle({
      x: pageWidth * 0.65 + 25,
      y: 200,
      width: 170,
      height: 120,
      color: blueAccent,
    });

    page.drawLine({
      start: { x: 60, y: pageHeight - 120 },
      end: { x: 160, y: pageHeight - 120 },
      thickness: 3,
      color: coral,
    });

    page.drawText('PLAYBOOK / 01', {
      x: 60,
      y: pageHeight - 95,
      size: 13,
      font: fontHelveticaBold,
      color: coral,
    });

    page.drawText('Mastering', {
      x: 60,
      y: pageHeight - 240,
      size: 64,
      font: fontTimesBold,
      color: textWhite,
    });

    page.drawText('Facebook', {
      x: 60,
      y: pageHeight - 320,
      size: 64,
      font: fontTimesBold,
      color: textWhite,
    });

    page.drawText('Ads', {
      x: 60,
      y: pageHeight - 400,
      size: 64,
      font: fontTimesBold,
      color: coral,
    });

    const sub1 = 'A comprehensive guide for beginners on how to create Facebook ads';
    const sub2 = 'from start to finish using a Sales campaign objective (Conversions).';
    page.drawText(sub1, {
      x: 60,
      y: 110,
      size: 13,
      font: fontHelvetica,
      color: rgb(0.75, 0.76, 0.78),
    });
    page.drawText(sub2, {
      x: 60,
      y: 90,
      size: 13,
      font: fontHelvetica,
      color: rgb(0.75, 0.76, 0.78),
    });

    page.drawText('SIGNAL / PERFORMANCE MARKETING', {
      x: pageWidth - 320,
      y: 45,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.6, 0.62, 0.65),
    });
  }

  function createPageContent({
    pageNum,
    category,
    sectionTag,
    title,
    subtitle,
    boxes = [],
    note = null,
  }) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: creamBg,
    });

    addStandardHeader(page, category, pageNum);

    let curY = pageHeight - 95;

    if (sectionTag) {
      page.drawText(safeText(sectionTag), {
        x: 50,
        y: curY,
        size: 12,
        font: fontHelveticaBold,
        color: coral,
      });
      curY -= 30;
    }

    page.drawText(safeText(title), {
      x: 50,
      y: curY,
      size: 34,
      font: fontTimesBold,
      color: textDark,
    });
    curY -= 28;

    if (subtitle) {
      page.drawText(safeText(subtitle), {
        x: 50,
        y: curY,
        size: 13,
        font: fontHelvetica,
        color: textMuted,
      });
      curY -= 45;
    }

    boxes.forEach(box => {
      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.w,
        height: box.h,
        color: box.bg || cardDark,
        borderColor: box.borderColor || box.bg,
        borderWidth: 1,
      });

      let innerY = box.y + box.h - 35;

      if (box.tag) {
        page.drawText(safeText(box.tag), {
          x: box.x + 25,
          y: innerY,
          size: 11,
          font: fontHelveticaBold,
          color: box.tagColor || coral,
        });
        innerY -= 28;
      }

      if (box.heading) {
        page.drawText(safeText(box.heading), {
          x: box.x + 25,
          y: innerY,
          size: 18,
          font: fontHelveticaBold,
          color: box.textColor || textWhite,
        });
        innerY -= 28;
      }

      if (box.paragraphs) {
        box.paragraphs.forEach(para => {
          page.drawText(safeText(para), {
            x: box.x + 25,
            y: innerY,
            size: box.textSize || 12,
            font: box.bold ? fontHelveticaBold : fontHelvetica,
            color: box.textColor || textWhite,
            lineHeight: 18,
          });
          innerY -= (box.lineGap || 22);
        });
      }
    });

    if (note) {
      page.drawRectangle({
        x: note.x || 500,
        y: note.y || 200,
        width: note.w || 380,
        height: note.h || 100,
        color: note.bg || coral,
      });

      let noteY = (note.y || 200) + (note.h || 100) - 30;
      note.lines.forEach(l => {
        page.drawText(safeText(l), {
          x: (note.x || 500) + 20,
          y: noteY,
          size: 13,
          font: fontHelveticaBold,
          color: textWhite,
        });
        noteY -= 22;
      });
    }
  }

  // PAGES 2 - 28 CONTENT DEFINITIONS
  createPageContent({
    pageNum: 2,
    category: 'ORIENTATION',
    sectionTag: 'START HERE',
    title: 'A guided route from idea to live ad',
    subtitle: 'This playbook is designed to make the Ads Manager journey legible, deliberate, and repeatable.',
    boxes: [
      {
        x: 60, y: 120, w: 380, h: 360,
        bg: cardDark,
        tag: 'THE PROMISE',
        paragraphs: [
          'Welcome to this comprehensive',
          'Facebook and Instagram ads tutorial!',
          '',
          'Whether you\'re a complete beginner or someone',
          'looking to fine-tune their ad campaigns, this',
          'guide will walk you through the entire process of',
          'creating effective Facebook and Instagram ads',
          'from scratch.',
          '',
          'By the end of this tutorial, you\'ll have a clear',
          'understanding of how to set up and launch ads',
          'that reach your target audience and achieve your',
          'marketing goals.'
        ]
      },
      {
        x: 480, y: 150, w: 180, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'CONTEXT',
        tagColor: coral,
        textColor: textDark,
        paragraphs: ['Creative research', 'starts with understanding', 'the current customer state.']
      },
      {
        x: 700, y: 150, w: 180, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'CREATIVE',
        tagColor: coral,
        textColor: textDark,
        paragraphs: ['Focus on compelling hooks', 'and relatable creative', 'that stops the scroll.']
      }
    ]
  });

  createPageContent({
    pageNum: 3,
    category: 'RESEARCH',
    sectionTag: '01 / RESEARCH',
    title: 'Borrow patterns, not identities',
    subtitle: 'Start with the market that already exists. The goal is to understand what is being communicated, and why it works.',
    boxes: [
      {
        x: 60, y: 150, w: 380, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'REFERENCE: FENTY SKIN',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Study active competitor pages and archives.',
          'Notice headline structures, video lengths,',
          'and customer pain points they address.',
          '',
          'Look at their primary text length,',
          'benefit bullets, and creative formats.'
        ]
      },
      {
        x: 470, y: 150, w: 460, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'MARKET INTELLIGENCE',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Analyze the ad formats being scaled.',
          'If a competitor has had an ad running for',
          'more than 60 days, it is profitable.',
          '',
          'Reverse engineer the hook angle, the offer,',
          'and the landing page destination.'
        ]
      }
    ],
    note: {
      x: 470, y: 380, w: 460, h: 70,
      bg: coral,
      lines: [
        'We\'re using skincare as the example, but this',
        'strategy works no matter what you\'re selling.'
      ]
    }
  });

  createPageContent({
    pageNum: 4,
    category: 'RESEARCH',
    sectionTag: '01 / RESEARCH',
    title: 'Open the Ad Library',
    subtitle: 'A clean four-step path from a public brand page to the creative archive behind it.',
    boxes: [
      {
        x: 60, y: 120, w: 420, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'FOUR-STEP AD LIBRARY PATH',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '01  Choose a live reference brand.',
          '02  Open their Facebook Page "About" tab.',
          '03  Navigate to "Page Transparency".',
          '04  Click "See All" and select "Ad Library".',
          '',
          'This opens Meta\'s public ad archive showing',
          'every active creative running right now.'
        ]
      },
      {
        x: 510, y: 120, w: 420, h: 220,
        bg: cardDark,
        tag: 'STRATEGY PRINCIPLE',
        tagColor: coral,
        paragraphs: [
          'The point is not to copy.',
          'It\'s to give your next creative decision',
          'a proven, market-tested reference.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 5,
    category: 'RESEARCH',
    sectionTag: '01 / RESEARCH',
    title: 'Read what is already live',
    subtitle: 'The Ad Library turns competitor activity into a practical source of creative direction.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'AD LIBRARY INSPECTION',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Search across active ads in your niche.',
          'Look for:',
          '• Launch date (older = profitable)',
          '• Multiple variations of the same angle',
          '• User-generated content vs studio shots',
          '• Direct call-to-action phrasing'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: cardDark,
        tag: 'WHAT TO LOOK FOR',
        paragraphs: [
          'Study the content and copy they use.',
          'Use this to guide the type of assets you create.',
          '',
          'If 30+ different ads are running,',
          'examine which hooks are repeated',
          'across different formats.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 6,
    category: 'SETUP',
    sectionTag: '02 / SETUP',
    title: 'Enter Ads Manager with one job',
    subtitle: 'We\'re focusing on one thing: setting up an ad from start to finish.',
    boxes: [
      {
        x: 60, y: 140, w: 400, h: 300,
        bg: cardDark,
        tag: 'THE FIRST MOVE',
        paragraphs: [
          'Once you sign up for Business Manager,',
          'go to Ads Manager and hit "Create".',
          '',
          'The big green button on the left.',
          '',
          'Do not get distracted by auxiliary tools.',
          'Build clean campaigns first.'
        ]
      },
      {
        x: 490, y: 140, w: 440, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'ACCOUNT PREPARATION',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Step 1: Connect your Facebook Page.',
          'Step 2: Connect your Instagram Account.',
          'Step 3: Add your billing payment method.',
          'Step 4: Verify your domain & Pixel dataset.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 7,
    category: 'SETUP',
    sectionTag: '02 / SETUP',
    title: 'Choose a campaign objective',
    subtitle: 'When you press Create, you can create your first ad campaign. The objective determines what Meta optimizes for.',
    boxes: [
      {
        x: 60, y: 140, w: 420, h: 300,
        bg: cardDark,
        tag: 'BEFORE YOU CLICK',
        paragraphs: [
          'There are 6 distinct marketing objectives:',
          '• Awareness',
          '• Traffic',
          '• Engagement',
          '• Leads',
          '• App Promotion',
          '• Sales',
          '',
          'Always optimize for your true business goal.'
        ]
      },
      {
        x: 510, y: 140, w: 420, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'THE ALGORITHM MANDATE',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Meta delivers exactly what you ask for.',
          'Ask for Traffic -> you get cheap link clickers.',
          'Ask for Video Views -> you get scrollers.',
          'Ask for Sales -> Meta finds buyers.',
          '',
          'For e-commerce & digital products: Choose Sales.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 8,
    category: 'OBJECTIVES',
    sectionTag: '03 / OBJECTIVES',
    title: 'Campaign objectives, decoded',
    subtitle: 'Choose the outcome first. The campaign structure follows.',
    boxes: [
      {
        x: 50, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'AWARENESS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Increase visibility and recognition.',
          'Goal is reach and brand recall,',
          'not immediate transactions.',
          'Best for large enterprise rebrands.'
        ]
      },
      {
        x: 350, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'TRAFFIC',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Drive visitors to a landing page.',
          'Optimizes for link clicks and',
          'landing page views.',
          'Good for blog reads, not sales.'
        ]
      },
      {
        x: 650, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'ENGAGEMENT',
        tagColor: rgb(0.1, 0.7, 0.4),
        textColor: textDark,
        paragraphs: [
          'Increase likes, comments, and shares.',
          'Builds community and social proof',
          'on specific organic posts.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 9,
    category: 'OBJECTIVES',
    sectionTag: '03 / OBJECTIVES',
    title: 'The rest of the menu',
    subtitle: 'Leads, app promotion, and sales each optimize for a different next action.',
    boxes: [
      {
        x: 50, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'LEADS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Collect contact info directly',
          'inside instant on-platform forms.',
          'Great for high-ticket service',
          'consultations and B2B.'
        ]
      },
      {
        x: 350, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'APP PROMOTION',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Drive mobile app installs and',
          'in-app purchases on iOS & Android.',
          'Requires SDK integration.'
        ]
      },
      {
        x: 650, y: 120, w: 270, h: 340,
        bg: rgb(1, 1, 1),
        borderColor: rgb(0.1, 0.7, 0.4),
        tag: 'SALES (RECOMMENDED)',
        tagColor: rgb(0.1, 0.7, 0.4),
        textColor: textDark,
        paragraphs: [
          'Drive conversions and purchases.',
          'Meta searches for people with',
          'a history of buying online.',
          'Highest revenue & ROI.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 10,
    category: 'SALES CAMPAIGN',
    sectionTag: '04 / SALES',
    title: 'For this guide: optimize for action',
    subtitle: 'If you\'re selling a physical or digital product, use a Sales campaign objective.',
    boxes: [
      {
        x: 60, y: 140, w: 440, h: 300,
        bg: cardDark,
        tag: 'WHY SALES OBJECTIVE WINS',
        paragraphs: [
          'Facebook tracks user behavior patterns.',
          'It knows who clicks, who reads, and who buys.',
          '',
          'When you choose Sales, you bypass low-intent',
          'scrollers and bid directly for buyers.'
        ]
      },
      {
        x: 530, y: 140, w: 400, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'SETUP CHECKLIST',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '1. Select "Sales" as campaign objective.',
          '2. Name campaign clearly.',
          '3. Click "Continue" to choose setup type.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 11,
    category: 'SALES CAMPAIGN',
    sectionTag: '04 / SALES',
    title: 'Start with a manual build',
    subtitle: 'If you have the new interface, select Manual Sales Campaign for maximum control.',
    boxes: [
      {
        x: 60, y: 140, w: 420, h: 300,
        bg: coral,
        tag: 'CAMPAIGN SETUP',
        tagColor: textWhite,
        heading: 'Manual Sales Campaign',
        paragraphs: [
          'A deliberate setup gives you full control',
          'over the campaign budget, ad set targeting,',
          'and creative layers that follow.'
        ]
      },
      {
        x: 510, y: 140, w: 420, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'WHY NOT ADVANTAGE+ SHOPPING YET?',
        tagColor: textDark,
        textColor: textDark,
        paragraphs: [
          'Advantage+ Shopping is great for accounts',
          'with 50+ conversions per week.',
          '',
          'When starting fresh, manual control prevents',
          'budget leaks and provides clean signal data.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 12,
    category: 'SALES CAMPAIGN',
    sectionTag: '04 / SALES',
    title: 'Name the campaign like a system',
    subtitle: 'A consistent naming convention keeps the account readable as it grows.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'THE FUNNEL SHORTHAND',
        paragraphs: [
          'TOF · NEW AUDIENCE',
          'Top of Funnel: Cold prospects who don\'t know you.',
          '',
          'MOF · NURTURE',
          'Middle of Funnel: Engaged visitors & video watchers.',
          '',
          'BOF · PURCHASED',
          'Bottom of Funnel: Past customers & repeat buyers.'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'EXAMPLE SYSTEM NAMES',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'TOF_Sales_Broad_eCom_2026',
          'TOF_Sales_Interest_SkinCare_Q1',
          'MOF_Retargeting_Visitors_30D',
          'BOF_Upsell_ExistingBuyers'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 13,
    category: 'SALES CAMPAIGN',
    sectionTag: '04 / SALES',
    title: 'Keep the first screen simple',
    subtitle: 'After naming your campaign, you don\'t need to fill in anything else on this screen.',
    boxes: [
      {
        x: 60, y: 140, w: 440, h: 280,
        bg: coral,
        tag: 'THE INSTRUCTION',
        tagColor: textWhite,
        paragraphs: [
          'Click the blue button in the bottom-right',
          'corner and click NEXT.',
          '',
          'One clean decision at a time.',
          'The real performance decisions arrive',
          'at the Ad Set level.'
        ]
      },
      {
        x: 530, y: 140, w: 400, h: 280,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'WHAT TO LEAVE DEFAULT',
        tagColor: textDark,
        textColor: textDark,
        paragraphs: [
          '• Special Ad Categories: None (unless credit/housing)',
          '• Buying Type: Auction',
          '• Campaign Objective: Sales',
          '• Advantage Campaign Budget: OFF for now'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 14,
    category: 'AD SET',
    sectionTag: '05 / AD SET',
    title: 'Set the conversion destination',
    subtitle: 'The Ad Set is where the conversion location and performance goal become explicit.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'CRITICAL 4-POINT CHECKLIST',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '1. Conversion Destination -> Select "Website".',
          '2. Performance Goal -> "Maximize number of conversions".',
          '3. Pixel -> Ensure your Meta Pixel is chosen.',
          '4. Conversion Event -> Select "Purchase".',
          '5. Cost Per Result Goal -> Leave blank during launch.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: cardDark,
        tag: 'WHY LEAVE COST PER RESULT BLANK?',
        paragraphs: [
          'Setting a tight bid ceiling stops your ads',
          'from entering the auction during the first 48h.',
          '',
          'Let Meta explore auction liquidity first,',
          'then apply caps once baseline CPA is proven.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 15,
    category: 'AD SET',
    sectionTag: '05 / AD SET',
    title: 'Choose a budget you can sustain',
    subtitle: 'Use a daily budget while the campaign learns.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'BUDGET & SCHEDULE RULES',
        paragraphs: [
          '• Leave Dynamic Creative OFF for this setup.',
          '• Choose a daily budget you can sustain for 7 days.',
          '• A great starting point: $20 – $50 / day.',
          '• Never increase daily budget by more than 20% at once.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'SCHEDULE TIME',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Set start time for midnight (12:01 AM).',
          '',
          'This allows Meta to pace your daily budget',
          'evenly across the full 24-hour cycle rather',
          'than rushing spend in the late afternoon.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 16,
    category: 'AUDIENCE',
    sectionTag: '06 / AUDIENCE',
    title: 'Define who the ad is for',
    subtitle: 'The strongest targeting decisions start with a clear picture of the person, not a long list of settings.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'WHY TARGETING MATTERS',
        paragraphs: [
          'Define your ideal avatar:',
          '• What pain keeps them awake at night?',
          '• What have they already tried that failed?',
          '• What specific transformation do they want?',
          '',
          'Targeting matches message to mindset.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'DATA PILLARS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Use Audience Insights, website analytics,',
          'and previous purchaser data to understand',
          'demographics and search behaviors.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 17,
    category: 'AUDIENCE',
    sectionTag: '06 / AUDIENCE',
    title: 'Build a broad TOF audience',
    subtitle: 'For a top-of-funnel Sales campaign, let the learning phase do useful work.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'BROAD TARGETING RULES',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '• Custom Audience: Leave completely empty.',
          '• Location: Select your core target country.',
          '• Age: Leave wide open (e.g. 18-65+).',
          '• Gender: All genders (unless gender-specific product).',
          '',
          'In 2026, the creative does the targeting.'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'THE ALGORITHM BENEFIT',
        paragraphs: [
          'Broad targeting gives Meta\'s AI the lowest CPMs.',
          '',
          'The hooks in your video and copy filter out',
          'unqualified users automatically.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 18,
    category: 'AUDIENCE',
    sectionTag: '06 / AUDIENCE',
    title: 'Use detailed targeting with intent',
    subtitle: 'Interests, behaviours, demographics, and more help Meta find people likely to be interested.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'TARGETING SIGNALS',
        paragraphs: [
          '• Affinity brands: Direct competitor pages',
          '• Category authorities: Top magazines, podcasts, tools',
          '• Behaviors: "Engaged Shoppers"',
          '',
          'Stack 3-5 closely related interests into a single',
          'ad set to give Meta sufficient audience size (2M+).'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'BEST PRACTICE',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Turn ON "Advantage Detailed Targeting".',
          '',
          'This allows Meta to expand beyond your chosen',
          'interests when it finds cheaper conversions.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 19,
    category: 'AUDIENCE',
    sectionTag: '06 / AUDIENCE',
    title: 'A practical research loop',
    subtitle: 'Instagram can show you the targeting logic behind the ads already reaching people like you.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'ON INSTAGRAM',
        paragraphs: [
          'Click on the 3 dots on any sponsored post.',
          'Select: "Why am I seeing this ad?"',
          '',
          'Meta will reveal:',
          '• The exact age & location settings',
          '• The exact interest lists used',
          '• Whether you are on a lookalike or custom list.'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'COMPETITIVE TAKEAWAYS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'Note down the interests being targeted.',
          'Analyze the creative hooks.',
          'Apply these exact interest clusters to your ad sets.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 20,
    category: 'CREATIVE',
    sectionTag: '07 / CREATIVE',
    title: 'Choose the shape of the ad',
    subtitle: 'Manual Upload means you will upload your own imagery.',
    boxes: [
      {
        x: 50, y: 130, w: 270, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: '01 SINGLE IMAGE / VIDEO',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          'One visual, one clear story.',
          'Ideal for direct product demonstrations',
          'and bold headline hooks.'
        ]
      },
      {
        x: 350, y: 130, w: 270, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: '02 CAROUSEL',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          '2 to 10 scrollable cards.',
          'Show multiple features, colors,',
          'or step-by-step frameworks.'
        ]
      },
      {
        x: 650, y: 130, w: 270, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: '03 COLLECTION',
        tagColor: rgb(0.1, 0.7, 0.4),
        textColor: textDark,
        paragraphs: [
          'Mobile fullscreen storefront.',
          'Seamless catalog experience for DTC brands.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 21,
    category: 'CREATIVE',
    sectionTag: '07 / CREATIVE',
    title: 'Turn the research into a brief',
    subtitle: 'After spying on competitors, you should have inspiration for content and ad copy.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'CREATIVE BRIEF CHECKLIST',
        paragraphs: [
          'Answer these 3 questions before designing:',
          '',
          '1. What is the single product or offer?',
          '2. What should the viewer notice in the first 3 seconds?',
          '3. What action should the ad make feel obvious?'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'HIGH-CONVERTING HOOKS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '• "Stop doing X if you want Y"',
          '• "The 3 biggest mistakes beginners make with..."',
          '• "Watch me turn $X into $Y using this..."',
          '• "Here is the exact framework we used to..."'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 22,
    category: 'CREATIVE',
    sectionTag: '07 / CREATIVE',
    title: 'Preview every placement',
    subtitle: 'After uploading your photo or video, check how the ad looks across Facebook and Instagram placements.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'PLACEMENT ASPECT RATIOS',
        tagColor: coral,
        textColor: textDark,
        paragraphs: [
          '• 9:16 vertical for Reels & Stories.',
          '• 1:1 square or 4:5 vertical for Feeds.',
          '• 16:9 landscape for In-Stream & Right Column.',
          '',
          'Customise crop settings per placement for perfection.'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'COPY ELEMENTS',
        paragraphs: [
          '• Primary Text: Compelling hook + benefit bullets.',
          '• Headline: Clear value proposition.',
          '• Description: Social proof or urgency.',
          '• Call to Action: "Shop Now" or "Download".'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 23,
    category: 'DESTINATION',
    sectionTag: '08 / DESTINATION',
    title: 'Make the next click make sense',
    subtitle: 'A destination is where a customer is sent immediately after tapping or clicking the ad\'s call to action.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'DESTINATION SETUP',
        paragraphs: [
          '• Website URL: The exact landing page where',
          '  the product is purchased.',
          '• Display URL: Clean vanity domain shown in the ad.',
          '',
          'Never send cold ad traffic to a generic homepage.',
          'Send them directly to the product detail page.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'URL PARAMETERS',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Always append UTM tags to track results:',
          'utm_source=facebook',
          'utm_medium=paid_social',
          'utm_campaign={{campaign.name}}',
          'utm_content={{ad.name}}'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 24,
    category: 'DESTINATION',
    sectionTag: '08 / DESTINATION',
    title: 'Website or shop, chosen intentionally',
    subtitle: 'Keep the handoff consistent. The landing experience should match the promise made in the ad.',
    boxes: [
      {
        x: 60, y: 140, w: 420, h: 300,
        bg: coral,
        tag: 'THE PROMISE HANDOFF',
        tagColor: textWhite,
        paragraphs: [
          'The destination is not a footnote.',
          'It is the second half of your conversion path.',
          '',
          'If your ad promises a "28-Page PDF Playbook",',
          'the headline of your landing page must say',
          '"28-Page PDF Playbook" above the fold.'
        ]
      },
      {
        x: 510, y: 140, w: 420, h: 300,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'SPEED & MOBILE OPTIMIZATION',
        tagColor: textDark,
        textColor: textDark,
        paragraphs: [
          'Over 90% of Meta ad traffic is on mobile.',
          '',
          'Ensure the checkout button is visible',
          'without excessive scrolling and pages load',
          'in under 2 seconds.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 25,
    category: 'AUDIENCE',
    sectionTag: '06 / AUDIENCE',
    title: 'The targeting principle still applies',
    subtitle: 'Detailed targeting helps advertisers reach specific audiences based on interests, behaviours, demographics, and more.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'A QUICK REMINDER',
        paragraphs: [
          '• Select from people\'s interests and activities.',
          '• Meta\'s algorithm uses this data to deliver ads',
          '  to prospects primed to take action.',
          '• The result is a campaign that becomes more',
          '  efficient as pixel conversion volume builds.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: coral,
        tag: 'THE GOLDEN TARGETING RULE',
        tagColor: textWhite,
        paragraphs: [
          'Targeting is a hypothesis.',
          'Performance is how you refine it.',
          '',
          'Let real data dictate which ad sets scale',
          'and which ad sets get turned off.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 26,
    category: 'LAUNCH',
    sectionTag: '09 / LAUNCH',
    title: 'Finish the signal layer',
    subtitle: 'Leave languages off unless you\'re selling to an audience that speaks a different language.',
    boxes: [
      {
        x: 60, y: 130, w: 440, h: 320,
        bg: cardDark,
        tag: 'TRACKING & PIXEL VERIFICATION',
        paragraphs: [
          'Ensure your Pixel appears here and',
          'Website Events is ticked.',
          '',
          'Before launch, verify three things:',
          '✓ The language setting is appropriate.',
          '✓ The pixel status is active (green dot).',
          '✓ Website events (Purchase) is selected.'
        ]
      },
      {
        x: 530, y: 130, w: 400, h: 320,
        bg: rgb(1, 1, 1),
        borderColor: borderLight,
        tag: 'CONVERSIONS API (CAPI)',
        tagColor: blueAccent,
        textColor: textDark,
        paragraphs: [
          'Combine browser pixel tracking with',
          'server-side Conversions API for maximum',
          'event match quality and resilience against',
          'ad blockers.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 27,
    category: 'LAUNCH',
    sectionTag: '09 / LAUNCH',
    title: 'Preview before you publish',
    subtitle: 'The Ad Preview shows how your ad will look once it goes live.',
    boxes: [
      {
        x: 60, y: 130, w: 420, h: 320,
        bg: cardDark,
        tag: 'FINAL REVIEW',
        paragraphs: [
          'Use the on-screen preview to review how your ad',
          'will look on Instagram Feed, Facebook Feed,',
          'and Reels.',
          '',
          'Make any necessary adjustments by clicking the',
          'edit button. Once satisfied, click Publish.'
        ]
      },
      {
        x: 510, y: 130, w: 420, h: 320,
        bg: coral,
        tag: 'THE LAST LOOK',
        tagColor: textWhite,
        paragraphs: [
          'Does the ad say what it needs to say —',
          'and send people exactly where they expect to go?',
          '',
          'If yes, you are ready to publish.'
        ]
      }
    ]
  });

  createPageContent({
    pageNum: 28,
    category: 'LAUNCH',
    sectionTag: '09 / LAUNCH',
    title: 'Publish with a final checklist',
    subtitle: 'Before publishing a Facebook ad, double-check that it is effective and meets Facebook\'s policies.',
    boxes: [
      {
        x: 60, y: 120, w: 500, h: 350,
        bg: cardDark,
        tag: 'BEFORE YOU CLICK PUBLISH',
        paragraphs: [
          '✓  Review ad text and imagery to ensure they comply with guidelines.',
          '✓  Ensure targeting is specific and relevant to the message.',
          '✓  Check that budget and bidding strategy align with objectives.',
          '✓  Make sure the landing page is functional, mobile-ready, and fast.',
          '✓  Proofread everything and double-check checkout links.'
        ],
        lineGap: 28
      },
      {
        x: 590, y: 120, w: 340, h: 350,
        bg: coral,
        tag: '→ CONGRATULATIONS',
        tagColor: textWhite,
        heading: 'PUBLISH',
        paragraphs: [
          'If you\'re happy with the setup —',
          'click PUBLISH.',
          '',
          'You have successfully built and',
          'launched your Facebook Ads',
          'Sales conversion campaign!'
        ],
        lineGap: 26
      }
    ]
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'assets', 'Mastering_Facebook_Ads.pdf');
  const aliasPath = path.join(__dirname, 'assets', 'Meta_Ads_Crash_Course_2026.pdf');

  fs.writeFileSync(outputPath, pdfBytes);
  fs.writeFileSync(aliasPath, pdfBytes);

  console.log(`Successfully generated 28-page PDF at: ${outputPath} (${pdfBytes.length} bytes)`);
}

createMasteringFacebookAdsPDF().catch(console.error);
