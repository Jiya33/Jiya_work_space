import type { EnglishLesson } from '../types'

/**
 * 内置英语学习资料库（2/2）：生活 / 健身 / 旅行 / 情绪 / 面试
 */
export const LESSONS_B: EnglishLesson[] = [
  // ══════════════════ 6. 生活日常 ══════════════════
  {
    id: 'daily-life',
    theme: '生活日常 Daily Life',
    emoji: '🏠',
    level: '入门',
    desc: '点餐、购物、租房、看医生、报修等真实生活场景',
    phrases: [
      { en: 'I’m just browsing, thanks.', zh: '我只是随便看看，谢谢。' },
      { en: 'Could I get the check, please?', zh: '麻烦买单。' },
      { en: 'Is this seat taken?', zh: '这个位子有人吗？' },
      { en: 'Do you take card?', zh: '你们收卡吗？' },
      { en: 'To go, please.', zh: '打包带走，谢谢。' },
      { en: 'It’s on me.', zh: '我请客。' },
      { en: 'Let’s split it.', zh: '我们 AA 吧。' },
      { en: 'Can I get a refill?', zh: '能再续一杯吗？' },
      { en: 'I’d like to return this.', zh: '我想退这个。' },
      { en: 'The sink is clogged.', zh: '水池堵了。' },
      { en: 'How long is the wait?', zh: '要等多久？' },
      { en: 'Keep the change.', zh: '不用找零了。' }
    ],
    sentences: [
      { en: 'Could I have that without onions, please?', zh: '这个能不加洋葱吗？' },
      { en: 'Do you have this in a size up?', zh: '这个有大一号的吗？' },
      { en: 'I bought this last week but it doesn’t fit — can I exchange it?', zh: '这是我上周买的，但不合身，能换吗？' },
      { en: 'The heating in my apartment hasn’t been working since Monday.', zh: '我公寓的暖气从周一开始就不工作了。' },
      { en: 'I’d like to make an appointment for a check-up.', zh: '我想预约做个体检。' },
      { en: 'Sorry, I think there’s a mistake on the bill.', zh: '不好意思，我觉得账单有误。' },
      { en: 'Would it be possible to move my reservation to seven?', zh: '我的预订能改到七点吗？' },
      { en: 'Is there a pharmacy around here that’s open late?', zh: '这附近有营业到很晚的药店吗？' },
      { en: 'I’ve been feeling a bit under the weather for a couple of days.', zh: '我这两天有点不舒服。' },
      { en: 'Do you know if this place delivers?', zh: '你知道这家店送外卖吗？' },
      { en: 'Could you keep an eye on my bag for a second?', zh: '能帮我看一下包吗？' },
      { en: 'I ordered this about forty minutes ago — could you check on it?', zh: '我大概四十分钟前点的，能帮我看看吗？' }
    ],
    paragraphs: [
      {
        title: 'The Politeness Layer',
        en: 'English wraps almost every request in a layer of softening language. Native speakers rarely say "Give me a coffee"; they say "Could I get a coffee, please?" even when the outcome is identical. To a learner this can feel wasteful, but the extra words carry information: they signal that you recognise the other person has a choice. Skipping the layer is not grammatically wrong, it simply sounds abrupt, which is why many fluent speakers still come across as rude without knowing why.',
        zh: '英语几乎会给每一个请求包上一层软化的措辞。母语者很少说「给我一杯咖啡」，而是说「我能要一杯咖啡吗，谢谢」，哪怕结果完全一样。对学习者来说这似乎很浪费，但这些多出来的词是有信息量的：它们在表示你意识到对方是有选择权的。省掉这一层在语法上并没有错，只是听起来生硬——这正是很多口语流利的人依然显得没礼貌、却不知道原因的地方。'
      },
      {
        title: 'When You Don’t Know the Word',
        en: 'Every learner eventually hits the moment where the exact word refuses to appear. The instinct is to freeze, but fluent communication is mostly about routing around gaps. Describe the function instead of naming the object: "the thing you use to open bottles" works perfectly well. Native speakers do this constantly with words they have forgotten, and nobody thinks less of them. The goal of speaking is not to prove vocabulary; it is to be understood quickly enough that the conversation keeps moving.',
        zh: '每个学习者都会遇到某个词死活想不起来的时刻。本能反应是卡住不动，但真正流畅的交流，大部分靠的是绕过缺口。与其去命名那个物件，不如描述它的功能：「那个用来开瓶子的东西」完全够用。母语者在忘词的时候也一直这么干，没有人因此看低他们。说话的目的不是证明词汇量，而是让对方足够快地听懂，好让对话继续往前走。'
      }
    ],
    dialogues: [
      [
        { role: 'Staff', en: 'Hi there, are you ready to order?', zh: '您好，可以点单了吗？' },
        { role: 'You', en: 'Almost. What would you recommend?', zh: '快好了。你有什么推荐吗？' },
        { role: 'Staff', en: 'The salmon is very popular today.', zh: '今天三文鱼很受欢迎。' },
        { role: 'You', en: 'Sounds good. Could I have that without the sauce?', zh: '听起来不错。可以不加酱汁吗？' },
        { role: 'Staff', en: 'Of course. Anything to drink?', zh: '当然。喝点什么吗？' },
        { role: 'You', en: 'Just tap water, thanks. And could we get the check together?', zh: '白开水就行，谢谢。另外我们能一起买单吗？' }
      ],
      [
        { role: 'You', en: 'Hi, I’m calling about the heating in apartment 5B.', zh: '你好，我想反映一下 5B 公寓的暖气问题。' },
        { role: 'Manager', en: 'What seems to be the problem?', zh: '是什么问题？' },
        { role: 'You', en: 'It hasn’t come on since Monday, and it’s getting pretty cold.', zh: '从周一开始就没启动过，现在挺冷的。' },
        { role: 'Manager', en: 'I’m sorry about that. I can send someone Thursday morning.', zh: '很抱歉。我可以周四上午派人过去。' },
        { role: 'You', en: 'Is there any chance of getting someone sooner?', zh: '有可能早一点吗？' },
        { role: 'Manager', en: 'Let me check. I might be able to do tomorrow afternoon.', zh: '我看看。也许明天下午可以。' }
      ]
    ],
    tips: [
      '生活英语的礼貌公式：Could I…? / Would it be possible to…? 比 I want 好一百倍。',
      '忘词时用描述代替命名（the thing you use to…），不要停下来。',
      '听不懂就说 Sorry, could you say that again more slowly? 完全不丢人。'
    ]
  },

  // ══════════════════ 7. 健身运动 ══════════════════
  {
    id: 'fitness',
    theme: '健身运动 Fitness',
    emoji: '🏋️',
    level: '入门',
    desc: '看懂英文训练视频、私教沟通、运动伤痛描述',
    phrases: [
      { en: 'Warm up / Cool down', zh: '热身 / 放松' },
      { en: 'Reps and sets', zh: '次数与组数' },
      { en: 'Engage your core', zh: '收紧核心' },
      { en: 'Keep your back neutral', zh: '保持背部中立位' },
      { en: 'Full range of motion', zh: '完整活动幅度' },
      { en: 'Progressive overload', zh: '渐进超负荷' },
      { en: 'Rest day', zh: '休息日' },
      { en: 'Sore, not injured', zh: '是酸痛，不是受伤' },
      { en: 'Push through the heels', zh: '用脚跟发力' },
      { en: 'Don’t lock your knees', zh: '膝盖不要锁死' },
      { en: 'Breathe out on the effort', zh: '发力时呼气' },
      { en: 'Time under tension', zh: '肌肉张力持续时间' }
    ],
    sentences: [
      { en: 'I’m trying to build strength without putting pressure on my knees.', zh: '我想在不给膝盖增加压力的前提下增强力量。' },
      { en: 'How many reps should I do before increasing the weight?', zh: '加重量之前我应该做多少次？' },
      { en: 'My lower back feels tight after deadlifts — is that normal?', zh: '硬拉后我的下背部发紧，这正常吗？' },
      { en: 'Could you check my form on this movement?', zh: '你能帮我看看这个动作的姿势吗？' },
      { en: 'I usually swim three times a week for about forty minutes.', zh: '我一般一周游三次，每次大约四十分钟。' },
      { en: 'I want to focus on my shoulders and upper back this month.', zh: '这个月我想重点练肩和上背。' },
      { en: 'Take a ninety-second rest between sets.', zh: '组间休息九十秒。' },
      { en: 'Start with a lighter weight and focus on control.', zh: '先用轻一点的重量，专注于控制。' },
      { en: 'I felt a sharp pain, so I stopped immediately.', zh: '我感到一阵刺痛，所以立刻停下了。' },
      { en: 'Consistency matters far more than intensity in the beginning.', zh: '刚开始时，规律性远比强度重要。' },
      { en: 'Let’s add one more set but keep the same weight.', zh: '我们再加一组，但重量不变。' },
      { en: 'I’m aiming for three sessions a week — I’d rather do less and keep going.', zh: '我的目标是一周三次——我宁愿少一点但能坚持下去。' }
    ],
    paragraphs: [
      {
        title: 'Sore Versus Injured',
        en: 'Learning to tell soreness from injury is the single most useful skill for anyone training on their own. Soreness is dull, spreads across the whole muscle, appears a day later, and fades as you move. Injury is sharp, points to one specific spot, often arrives during the movement itself, and gets worse when you load it again. The rule most coaches use is simple: if it hurts in a way you can point at with one finger, stop and let it settle before you push again.',
        zh: '分清「酸痛」和「受伤」，是所有自主训练者最有用的一项能力。酸痛是钝的，分布在整块肌肉上，通常第二天才出现，活动开之后会减轻。受伤是尖锐的，能指向某一个具体的点，往往在动作过程中就发生，再次加载时还会更糟。大多数教练用的判断标准很简单：如果这个痛你能用一根手指精确指出来，就停下，让它缓过来再练。'
      },
      {
        title: 'Why Consistency Beats Intensity',
        en: 'Most people quit training not because it was too hard but because it was too much. A brutal first week produces soreness that makes the second week feel impossible, and the habit dies before it forms. The alternative is deliberately underdoing it at the start: finish each session feeling like you could have done one more set. That leftover energy is what makes you willing to come back, and coming back is the only variable that reliably predicts results a year later.',
        zh: '大多数人放弃训练，不是因为太难，而是因为太多。第一周的极限强度带来的酸痛，会让第二周显得不可能完成，习惯还没形成就死掉了。另一种做法是刻意在开始阶段「练不满」：每次结束时都感觉自己还能再做一组。正是这份剩余的余力，让你愿意下次再来——而「愿意再来」是唯一能可靠预测一年后成果的变量。'
      }
    ],
    dialogues: [
      [
        { role: 'Coach', en: 'Alright, let’s start with a five-minute warm-up.', zh: '好，我们先做五分钟热身。' },
        { role: 'You', en: 'Sure. Should I do the bike or just stretch?', zh: '好的。我该骑车还是拉伸就行？' },
        { role: 'Coach', en: 'Bike is better — we want blood flow, not static stretching.', zh: '骑车更好，我们要的是血液循环，不是静态拉伸。' },
        { role: 'You', en: 'Got it. My knees have been a bit sensitive lately.', zh: '明白。我膝盖最近有点敏感。' },
        { role: 'Coach', en: 'Then we’ll skip jumping today and focus on controlled squats.', zh: '那今天跳跃就跳过，专注做有控制的深蹲。' },
        { role: 'You', en: 'Sounds good. Could you check my form on the first set?', zh: '好的。第一组你能帮我看看姿势吗？' }
      ],
      [
        { role: 'You', en: 'I felt something in my lower back on the last rep.', zh: '最后一次我感觉下背部有点不对劲。' },
        { role: 'Coach', en: 'Sharp or dull? Can you point to it?', zh: '是刺痛还是酸胀？你能指出来吗？' },
        { role: 'You', en: 'Kind of sharp, right here on the left side.', zh: '有点刺，就在左边这里。' },
        { role: 'Coach', en: 'Then we stop that movement today. Let’s not risk it.', zh: '那今天这个动作就停了，不冒这个险。' },
        { role: 'You', en: 'Should I still do the rest of the session?', zh: '剩下的训练还能做吗？' },
        { role: 'Coach', en: 'Upper body only, and ice it tonight. See how it feels tomorrow.', zh: '只练上肢，今晚冰敷，明天看看情况。' }
      ]
    ],
    tips: [
      '英文健身视频高频指令：engage your core / keep it controlled / don’t rush the negative。',
      '描述疼痛用 sharp（刺痛）/ dull（钝痛）/ tight（紧绷），医生和教练都听得懂。',
      '看视频时把语速调到 0.75x 跟读一遍动作口令，比单纯背单词有效。'
    ]
  },

  // ══════════════════ 8. 旅行出行 ══════════════════
  {
    id: 'travel',
    theme: '旅行出行 Travel',
    emoji: '✈️',
    level: '入门',
    desc: '值机、转机、入住、问路、突发状况处理',
    phrases: [
      { en: 'Aisle or window?', zh: '过道还是靠窗？' },
      { en: 'Carry-on luggage', zh: '随身行李' },
      { en: 'Boarding gate', zh: '登机口' },
      { en: 'My flight got delayed.', zh: '我的航班延误了。' },
      { en: 'I have a connecting flight.', zh: '我有转机。' },
      { en: 'Check-in / Check-out', zh: '入住 / 退房' },
      { en: 'Is breakfast included?', zh: '含早餐吗？' },
      { en: 'Could you call me a taxi?', zh: '能帮我叫辆车吗？' },
      { en: 'How do I get to…?', zh: '我怎么去……？' },
      { en: 'It’s within walking distance.', zh: '走路就能到。' },
      { en: 'I’d like to extend my stay.', zh: '我想延住。' },
      { en: 'My luggage didn’t arrive.', zh: '我的行李没到。' }
    ],
    sentences: [
      { en: 'I have a two-hour layover — will I have enough time to transfer?', zh: '我有两小时的中转时间，够转机吗？' },
      { en: 'Excuse me, is this the right line for international departures?', zh: '打扰一下，这是国际出发的队伍吗？' },
      { en: 'Could I check in early if a room is available?', zh: '如果有空房，我能提前入住吗？' },
      { en: 'Is there a shuttle from the airport to the city centre?', zh: '机场到市中心有摆渡车吗？' },
      { en: 'I booked through the app but I can’t find my reservation.', zh: '我在 App 上订的，但找不到我的预订记录。' },
      { en: 'What time do I need to be at the gate?', zh: '我需要几点到登机口？' },
      { en: 'Could you write down the address for me? I’ll show it to the driver.', zh: '能帮我把地址写下来吗？我给司机看。' },
      { en: 'Is it safe to walk around this area at night?', zh: '这一带晚上走路安全吗？' },
      { en: 'My flight was cancelled — what are my options?', zh: '我的航班取消了，我有哪些选择？' },
      { en: 'Do you know somewhere good to eat that isn’t too touristy?', zh: '你知道哪里有不太游客化的好餐厅吗？' },
      { en: 'I’d rather take the train — it drops you right in the centre.', zh: '我更想坐火车，直接到市中心。' },
      { en: 'Could I leave my bags here until my train at six?', zh: '我能把行李寄存到六点的火车吗？' }
    ],
    paragraphs: [
      {
        title: 'Traveling Without the Script',
        en: 'Guidebooks prepare you for the transactions but not for the moments in between. The most memorable parts of a trip usually happen when a plan breaks: a missed train, a closed museum, a wrong turn into a neighbourhood nobody recommended. Those situations force you to speak, and speaking under mild pressure is where language actually consolidates. If you find yourself only using English to buy things, you are practising a very small slice of it.',
        zh: '旅行指南能帮你应付各种交易场景，却帮不了夹在中间的那些时刻。一趟旅行中最难忘的部分，往往发生在计划被打乱的时候：错过的火车、闭馆的博物馆、拐错弯走进的某个没人推荐的街区。这些情境逼着你开口，而在轻度压力下开口，恰恰是语言真正固化下来的地方。如果你发现自己只在买东西时才用英语，那你练的只是它极小的一部分。'
      },
      {
        title: 'Asking for Directions the Right Way',
        en: 'The problem with asking for directions is not understanding the answer. A stranger will happily fire off four turns and two landmarks in ten seconds, and you will remember roughly none of it. Experienced travellers ask smaller questions: "Am I going the right way for the station?" gets a yes or no, which is almost impossible to misunderstand. Then ask again two blocks later. Three easy questions beat one hard one every time.',
        zh: '问路真正的难点不在于开口，而在于听懂答案。一个陌生人会在十秒内热情地报出四个转弯和两个地标，而你基本一个都记不住。有经验的旅行者会问更小的问题：「去车站是往这个方向走吗？」——答案只有是或否，几乎不可能听错。然后走两个街区再问一次。三个简单问题，永远好过一个复杂问题。'
      }
    ],
    dialogues: [
      [
        { role: 'Agent', en: 'Good morning. May I see your passport, please?', zh: '早上好，请出示您的护照。' },
        { role: 'You', en: 'Here you go. I have a connecting flight in Amsterdam.', zh: '给您。我在阿姆斯特丹转机。' },
        { role: 'Agent', en: 'I can check your bag all the way through. Aisle or window?', zh: '您的行李可以直挂到底。过道还是靠窗？' },
        { role: 'You', en: 'Aisle, please. How long is the layover?', zh: '过道，谢谢。中转时间多久？' },
        { role: 'Agent', en: 'One hour fifty. Gate information will be on the screens.', zh: '一小时五十分钟。登机口信息看屏幕。' },
        { role: 'You', en: 'Is that enough time to clear security again?', zh: '这时间够再过一次安检吗？' }
      ],
      [
        { role: 'You', en: 'Excuse me, am I going the right way for the old town?', zh: '打扰一下，去老城区是这个方向吗？' },
        { role: 'Local', en: 'Yes, keep going straight for about ten minutes.', zh: '是的，一直走大约十分钟。' },
        { role: 'You', en: 'Great, thanks. Is it worth taking the tram instead?', zh: '太好了，谢谢。坐电车会更好吗？' },
        { role: 'Local', en: 'Not really — it’s within walking distance and the walk is nice.', zh: '不太必要，走路就能到，而且这段路挺好看的。' },
        { role: 'You', en: 'Perfect. Do you know anywhere good to eat around there?', zh: '太好了。你知道那边哪里吃饭不错吗？' },
        { role: 'Local', en: 'Avoid the main square. Go one street behind it — much better.', zh: '别去主广场。往后走一条街，好得多。' }
      ]
    ],
    tips: [
      '问路要问「是/否」问题，别问开放式问题，否则听不懂答案。',
      '突发状况万能句：What are my options? 比 What should I do? 更能拿到方案。',
      '把关键地址截图给对方看，比反复拼读地名高效得多。'
    ]
  },

  // ══════════════════ 9. 情绪与共情 ══════════════════
  {
    id: 'emotions',
    theme: '情绪与共情 Emotions',
    emoji: '💗',
    level: '进阶',
    desc: '安慰他人、表达感受、设定边界的分寸感',
    phrases: [
      { en: 'That sounds really tough.', zh: '这听起来真的很难熬。' },
      { en: 'I’m here if you need me.', zh: '需要我的话我一直在。' },
      { en: 'Take your time.', zh: '你慢慢来。' },
      { en: 'I appreciate you telling me.', zh: '谢谢你愿意告诉我。' },
      { en: 'I feel overwhelmed.', zh: '我感觉压力太大了。' },
      { en: 'I need some space.', zh: '我需要一点空间。' },
      { en: 'It’s okay to not be okay.', zh: '状态不好也没关系。' },
      { en: 'I didn’t mean to upset you.', zh: '我不是有意让你难过的。' },
      { en: 'Can we talk about this later?', zh: '我们能晚点再聊这个吗？' },
      { en: 'That’s not on you.', zh: '这不是你的错。' },
      { en: 'I hear you.', zh: '我听见你说的了 / 我懂你。' },
      { en: 'How are you holding up?', zh: '你还撑得住吗？' }
    ],
    sentences: [
      { en: 'I don’t need advice right now — I just need to vent for a minute.', zh: '我现在不需要建议，我只想吐槽一会儿。' },
      { en: 'I’ve been feeling stretched thin, and I think I need to say no to something.', zh: '我最近感觉被拉扯得太满，我想我得拒绝掉一些事。' },
      { en: 'It sounds like you’ve been carrying this on your own for a while.', zh: '听起来你一个人扛这件事已经有一阵子了。' },
      { en: 'I’m not upset with you, I’m just tired and I handled it badly.', zh: '我不是在生你的气，我只是太累了，处理得不好。' },
      { en: 'Would it help to talk it through, or would you rather be distracted?', zh: '你是想聊聊，还是想被转移一下注意力？' },
      { en: 'I want to be honest with you, even though it’s uncomfortable.', zh: '尽管有点不舒服，我还是想跟你说实话。' },
      { en: 'I can’t take that on right now, but I can help next week.', zh: '我现在接不了这件事，但下周可以帮你。' },
      { en: 'Thank you for being patient with me while I figured that out.', zh: '谢谢你在我想明白之前一直很有耐心。' },
      { en: 'I noticed you’ve been quiet lately — is everything alright?', zh: '我注意到你最近话少了，还好吗？' },
      { en: 'I don’t have the right words, but I’m really sorry this happened.', zh: '我不知道该说什么，但我真的很遗憾发生了这件事。' },
      { en: 'That must have been frustrating after all the work you put in.', zh: '在你付出那么多之后，这一定让人很挫败。' },
      { en: 'Let’s check in again in a few days.', zh: '过几天我们再聊聊。' }
    ],
    paragraphs: [
      {
        title: 'Listening Without Fixing',
        en: 'When someone shares a difficulty, the instinct is to offer solutions, because solving feels like helping. But most people who open up are not looking for a plan; they are looking for confirmation that their reaction makes sense. Jumping straight to advice quietly communicates that their feelings were a problem to be cleared away. A single sentence — "That sounds really hard" — often does more than a well-designed plan, because it answers the question they were actually asking.',
        zh: '当有人倾诉困境时，我们的本能是提供解决方案，因为「解决」感觉起来就是「帮忙」。但大多数愿意敞开的人并不是在找一份计划，他们是在寻求确认：自己的反应是合理的。直接跳到建议，其实是在无声地传达「你的情绪是个需要被清理掉的麻烦」。一句「这听起来真的很难」往往比一份精心设计的方案更有用，因为它回答的是对方真正在问的那个问题。'
      },
      {
        title: 'Boundaries Are Not Rejection',
        en: 'Saying no to a person feels like rejecting them, which is why so many people over-commit and then resent it. A clean boundary separates the request from the relationship: "I can’t help with this one, and I still want to hear how it goes." The second half matters as much as the first. Boundaries stated warmly are almost always accepted; it is the ones delivered with guilt or apology that invite negotiation, because guilt reads as uncertainty.',
        zh: '对一个人说不，感觉上像是在拒绝这个人本身——这就是为什么很多人过度承诺，事后又心生怨气。一个干净的边界会把「请求」和「关系」分开：「这件事我帮不了，但我还是想知道后续怎么样。」后半句和前半句同样重要。用温暖的语气说出的边界几乎总能被接受；反倒是那些夹带愧疚和道歉的边界会引来讨价还价，因为愧疚会被读成「你其实还没想好」。'
      }
    ],
    dialogues: [
      [
        { role: 'A', en: 'I completely bombed the presentation today.', zh: '我今天的演讲搞砸了。' },
        { role: 'B', en: 'Oh no. That sounds really tough. What happened?', zh: '天哪。听起来真难受。怎么了？' },
        { role: 'A', en: 'I froze halfway through and lost my train of thought.', zh: '我讲到一半卡住了，思路断了。' },
        { role: 'B', en: 'That must have been frustrating after all the prep you did.', zh: '你准备了那么久，这一定很挫败。' },
        { role: 'A', en: 'Yeah. I don’t really need advice, I just needed to say it out loud.', zh: '是啊。我其实不需要建议，只是想说出来。' },
        { role: 'B', en: 'I hear you. I’m around if you want to talk more later.', zh: '我懂。晚点想聊的话我都在。' }
      ],
      [
        { role: 'A', en: 'Could you cover my shift on Saturday? I know it’s short notice.', zh: '周六你能帮我顶班吗？我知道有点临时。' },
        { role: 'B', en: 'I can’t take that on this weekend — I’m already stretched thin.', zh: '这周末我接不了，我已经排得太满了。' },
        { role: 'A', en: 'No worries. I’ll ask someone else.', zh: '没关系，我再问问别人。' },
        { role: 'B', en: 'I do want to help though. Would next Saturday work instead?', zh: '不过我确实想帮忙。下周六可以吗？' },
        { role: 'A', en: 'Actually that would be even better. Thank you.', zh: '其实那样更好，谢谢你。' },
        { role: 'B', en: 'Of course. And let me know how Saturday goes.', zh: '应该的。周六的情况告诉我一声。' }
      ]
    ],
    tips: [
      '共情三步：命名情绪 → 承认合理 → 不急着给方案（That sounds… / It makes sense that… ）。',
      '设边界的黄金句式：I can’t do X, but I can do Y. 拒绝 + 替代，不带歉意。',
      '"I hear you" 是英语里最短的共情表达，比 "I understand" 更不居高临下。'
    ]
  },

  // ══════════════════ 10. 面试英语 ══════════════════
  {
    id: 'interview',
    theme: '面试英语 Interview',
    emoji: '🎤',
    level: '高阶',
    desc: '自我介绍、STAR 回答、反问面试官、谈薪资',
    phrases: [
      { en: 'Walk me through your resume.', zh: '介绍一下你的履历。' },
      { en: 'Tell me about a time when…', zh: '讲一个你……的经历。' },
      { en: 'My biggest strength is…', zh: '我最大的优势是……' },
      { en: 'A stretch assignment', zh: '有挑战性的任务' },
      { en: 'Cross-functional collaboration', zh: '跨职能协作' },
      { en: 'End-to-end ownership', zh: '端到端负责' },
      { en: 'I took the initiative to…', zh: '我主动去做了……' },
      { en: 'The outcome was…', zh: '最终结果是……' },
      { en: 'What does success look like in this role?', zh: '这个岗位怎样算做得好？' },
      { en: 'Compensation range', zh: '薪资区间' },
      { en: 'I’m looking for growth, not just a title.', zh: '我看重成长，而不只是头衔。' },
      { en: 'What are the next steps?', zh: '接下来的流程是什么？' }
    ],
    sentences: [
      { en: 'I’m a product manager with five years of experience, mostly in B2B tools.', zh: '我是有五年经验的产品经理，主要做 B2B 工具。' },
      { en: 'In my last role, I owned the onboarding flow end to end.', zh: '在上一份工作中，我端到端负责用户引导流程。' },
      { en: 'The situation was that activation had dropped fifteen percent in one quarter.', zh: '当时的情况是，一个季度内激活率下降了 15%。' },
      { en: 'My task was to figure out why and to stop the decline.', zh: '我的任务是找出原因并止住下滑。' },
      { en: 'I ran eight user interviews and found the sign-up form was the main drop-off.', zh: '我做了八场用户访谈，发现注册表单是主要流失点。' },
      { en: 'As a result, activation recovered to eighty-one percent within two months.', zh: '结果是，两个月内激活率回升到 81%。' },
      { en: 'What I learned was to validate with users before trusting the dashboard.', zh: '我学到的是，在相信数据看板之前先跟用户验证。' },
      { en: 'I work best in teams where disagreement is treated as useful, not personal.', zh: '我在把分歧当作有益而非针对个人的团队里状态最好。' },
      { en: 'Honestly, my weakness is that I over-index on detail early on.', zh: '坦白说，我的弱点是前期过于关注细节。' },
      { en: 'Could you tell me what the first ninety days would look like?', zh: '能讲讲入职前 90 天大概是什么样吗？' },
      { en: 'Based on my experience and the market, I’m targeting the upper half of that range.', zh: '基于我的经验和市场情况，我期望在这个区间的中上部。' },
      { en: 'I’m interviewing with two other companies, but this role is my first choice.', zh: '我也在面另外两家公司，但这个岗位是我的第一选择。' }
    ],
    paragraphs: [
      {
        title: 'The STAR Method, Properly Used',
        en: 'STAR stands for Situation, Task, Action and Result, and most candidates get three of the four right. They set the scene, describe what needed doing, list what they did — and then stop, leaving the interviewer to guess whether any of it worked. The result is the only part the interviewer is actually evaluating. Quantify it if you can, and if the outcome was a failure, say so and add what changed in your approach afterwards. A well-told failure is often more convincing than a vague success.',
        zh: 'STAR 指的是情境、任务、行动和结果，而大多数候选人只答对了其中三个。他们铺垫了背景、说明了要做什么、列举了自己做了什么——然后就停了，留面试官自己去猜这些到底有没有奏效。而「结果」恰恰是面试官真正在评估的部分。能量化就量化；如果结果是失败，就直说，并补上你之后改变了什么。一个讲得好的失败，往往比一个含糊的成功更有说服力。'
      },
      {
        title: 'The Questions You Ask Are Part of the Answer',
        en: 'At the end of an interview, "Do you have any questions for us?" is not a courtesy — it is the last scored section. Asking about holiday policy signals that you have already mentally accepted the offer and are checking the terms. Asking what success looks like in the first ninety days, or what the team currently disagrees about, signals that you are evaluating the work itself. The best candidates leave the room having learned something, not just having performed well.',
        zh: '面试结尾那句「你有什么想问我们的吗？」并不是客套——它是最后一个计分环节。问假期政策，等于在说你心里已经接受了 offer，只是在核对条款。而问「入职前 90 天怎样算做得好」，或者「团队目前在哪些事情上有分歧」，传达的是你在评估这份工作本身。最好的候选人离开面试间时，是带走了信息，而不只是表现得体。'
      }
    ],
    dialogues: [
      [
        { role: 'Q', en: 'Tell me about a time you had to change your mind.', zh: '讲一个你不得不改变看法的经历。' },
        { role: 'A', en: 'Sure. Last year I was convinced we needed a full redesign.', zh: '好的。去年我坚信我们需要一次彻底的改版。' },
        { role: 'Q', en: 'What made you rethink it?', zh: '是什么让你重新考虑的？' },
        { role: 'A', en: 'Five user interviews. The complaints were about speed, not layout.', zh: '五场用户访谈。抱怨集中在速度，不是布局。' },
        { role: 'Q', en: 'So what did you do instead?', zh: '那你改做了什么？' },
        { role: 'A', en: 'We shipped performance fixes. Complaints dropped forty percent in a month.', zh: '我们上线了性能优化，一个月内投诉下降了 40%。' }
      ],
      [
        { role: 'Q', en: 'Do you have any questions for us?', zh: '你有什么想问我们的吗？' },
        { role: 'A', en: 'Yes. What does success look like in this role after ninety days?', zh: '有的。这个岗位入职 90 天后，怎样算做得好？' },
        { role: 'Q', en: 'Good question. Probably owning one product area independently.', zh: '好问题。大概是能独立负责一个产品方向。' },
        { role: 'A', en: 'That’s helpful. What does the team currently disagree about most?', zh: '很有帮助。团队目前在什么问题上分歧最大？' },
        { role: 'Q', en: 'Whether to go deeper on enterprise or broaden the self-serve product.', zh: '是深耕企业客户，还是拓宽自助产品。' },
        { role: 'A', en: 'Interesting. And what are the next steps in the process?', zh: '很有意思。接下来的流程是什么？' }
      ]
    ],
    tips: [
      'STAR 里最容易漏掉的是 Result，一定要给数字或明确变化。',
      '谈薪资先反问区间（What’s the range for this role?），再报自己的预期。',
      '结尾反问不要问假期，要问「成功标准」和「团队分歧」，显示你在评估工作本身。'
    ]
  }
]
