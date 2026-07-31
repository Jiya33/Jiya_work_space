import type { EnglishLesson } from '../types'

/**
 * 内置英语学习资料库
 * 每个单元包含：短语 / 句子 / 段落精读 / 口语对话 / 学习提示
 * 按日期轮换推送「今日学习」
 */
export const ENGLISH_LESSONS: EnglishLesson[] = [
  {
    id: 'small-talk',
    theme: '日常寒暄 Small Talk',
    emoji: '👋',
    level: '入门',
    phrases: [
      { en: 'How’s it going?', zh: '最近怎么样？（比 How are you 更自然）' },
      { en: 'Long time no see.', zh: '好久不见。' },
      { en: 'What have you been up to?', zh: '你最近在忙什么？' },
      { en: 'Same here.', zh: '我也一样。' },
      { en: 'I’ll catch you later.', zh: '回头聊。' },
      { en: 'Take care.', zh: '保重。（告别常用）' }
    ],
    sentences: [
      { en: 'I’ve been swamped with work lately, but things are finally settling down.', zh: '我最近工作忙得不可开交，不过总算慢慢缓过来了。' },
      { en: 'The weather has been unusually warm for this time of year.', zh: '这个时节的天气暖和得有点反常。' },
      { en: 'I just moved to a new place, so I’m still getting used to the commute.', zh: '我刚搬了新住处，还在适应通勤。' },
      { en: 'We should grab coffee sometime and properly catch up.', zh: '我们找时间喝杯咖啡，好好聊聊。' },
      { en: 'Sorry, I didn’t catch that — could you say it again?', zh: '抱歉没听清，能再说一遍吗？' },
      { en: 'It was really nice running into you.', zh: '很高兴偶遇你。' }
    ],
    paragraph: {
      title: 'Why Small Talk Matters',
      en: 'Small talk is often dismissed as meaningless chatter, but it serves a real social function. It lowers the barrier between strangers and creates a safe space where deeper conversation can begin. A short exchange about the weather or the weekend signals that you are approachable and willing to engage. In professional settings, the two minutes before a meeting starts often build more trust than the meeting itself.',
      zh: '闲聊常被视为无意义的搭话，但它其实有真实的社交功能。它降低了陌生人之间的壁垒，创造出一个可以展开深度对话的安全空间。一段关于天气或周末的简短交流，传递出你平易近人、愿意交流的信号。在职场中，会议开始前的那两分钟，往往比会议本身建立起更多信任。'
    },
    dialogue: [
      { role: 'A', en: 'Hey! Long time no see. How have you been?', zh: '嘿！好久不见，你怎么样？' },
      { role: 'B', en: 'Pretty good, thanks. Busy as always. How about you?', zh: '挺好的，谢谢。一如既往地忙。你呢？' },
      { role: 'A', en: 'Can’t complain. I just started a side project actually.', zh: '还不错。我最近开始做一个副业项目。' },
      { role: 'B', en: 'Oh really? What kind of project?', zh: '是吗？什么样的项目？' },
      { role: 'A', en: 'A little productivity app. Nothing fancy, but I’m enjoying it.', zh: '一个小的效率工具应用。没多复杂，但我做得挺开心。' },
      { role: 'B', en: 'That sounds great. Let’s grab coffee and you can tell me more.', zh: '听起来不错。改天喝咖啡，你再细讲给我听。' }
    ],
    tips: [
      '寒暄的关键是「接话」而不是「答题」：回答后反问一句，对话才能继续。',
      '避免用 "I\'m fine, thank you, and you?" 这种教科书式回答，太生硬。',
      '推荐影子跟读法：播放音频，延迟 1 秒跟读，重点模仿语调而非单词。'
    ]
  },
  {
    id: 'workplace',
    theme: '职场沟通 Workplace',
    emoji: '💼',
    level: '进阶',
    phrases: [
      { en: 'Circle back on this', zh: '稍后再回到这个话题' },
      { en: 'Loop someone in', zh: '把某人拉进讨论 / 抄送某人' },
      { en: 'Touch base', zh: '简短同步一下进展' },
      { en: 'On the same page', zh: '达成共识' },
      { en: 'Take ownership of', zh: '主动负责起某事' },
      { en: 'Bandwidth', zh: '（工作）精力 / 余力' }
    ],
    sentences: [
      { en: 'Let me loop in the design team before we finalize this.', zh: '在敲定之前，我先把设计团队拉进来。' },
      { en: 'I don’t have the bandwidth to take this on this week.', zh: '这周我没有精力接这个活。' },
      { en: 'Just to make sure we’re on the same page — the deadline is next Friday, right?', zh: '确认一下我们理解一致——截止日是下周五，对吗？' },
      { en: 'Could you give me a quick status update by end of day?', zh: '你能在今天下班前简单同步一下进展吗？' },
      { en: 'I’d like to push back on that timeline — it’s not realistic given our current scope.', zh: '我想对这个时间表提出异议——按目前的范围来看不现实。' },
      { en: 'Let’s park that discussion and revisit it next sprint.', zh: '我们先搁置这个讨论，下个迭代再看。' }
    ],
    paragraph: {
      title: 'Disagreeing Without Friction',
      en: 'In English-speaking workplaces, direct disagreement is usually softened by framing. Instead of saying "That’s wrong," people say "I see it a bit differently" or "Help me understand the reasoning here." This is not dishonesty; it is a way of separating the idea from the person holding it. The goal is to keep the discussion open long enough for the better argument to surface, rather than forcing an early winner.',
      zh: '在英语职场中，直接的反对通常会通过措辞来软化。人们不会说「那是错的」，而是说「我的看法稍有不同」或者「帮我理解一下这里的逻辑」。这不是虚伪，而是把观点和持有观点的人区分开的一种方式。目的是让讨论保持开放足够久，好让更优的论证浮现出来，而不是急着分出胜负。'
    },
    dialogue: [
      { role: 'PM', en: 'I think we should ship the feature this Friday.', zh: '我觉得我们应该这周五上线这个功能。' },
      { role: 'Dev', en: 'I see it a bit differently. We still have three open bugs.', zh: '我的看法有点不同，我们还有三个未解决的 bug。' },
      { role: 'PM', en: 'Fair point. Are any of them blockers?', zh: '有道理。其中有阻塞性的吗？' },
      { role: 'Dev', en: 'One is. The other two are cosmetic and can wait.', zh: '有一个是。另外两个只是样式问题，可以先放着。' },
      { role: 'PM', en: 'Okay — can we fix the blocker by Thursday and ship Friday?', zh: '好，那我们周四前修掉阻塞项，周五上线可以吗？' },
      { role: 'Dev', en: 'That works. I’ll keep you posted on the progress.', zh: '可以。我会随时同步进展给你。' }
    ],
    tips: [
      '"push back" 是职场高频词，表示有依据地反对，不带情绪。',
      '收邮件结尾常用：Best, / Thanks, / Looking forward to your thoughts.',
      '用 "Help me understand..." 开头提问，比直接质疑更容易得到配合。'
    ]
  },
  {
    id: 'meeting',
    theme: '会议与汇报 Meetings',
    emoji: '📊',
    level: '进阶',
    phrases: [
      { en: 'Let’s dive in', zh: '我们开始吧 / 深入聊聊' },
      { en: 'To recap', zh: '简单回顾一下' },
      { en: 'Action items', zh: '待办事项' },
      { en: 'Table this for now', zh: '暂时搁置' },
      { en: 'Play devil’s advocate', zh: '故意唱反调（为了检验思路）' },
      { en: 'Wrap up', zh: '收尾 / 结束' }
    ],
    sentences: [
      { en: 'Thanks everyone for joining. I’ll keep this to twenty minutes.', zh: '感谢大家参加，我会把会议控制在二十分钟内。' },
      { en: 'To recap, we agreed on three action items and two open questions.', zh: '回顾一下，我们确定了三个待办和两个待解问题。' },
      { en: 'Let me share my screen and walk you through the numbers.', zh: '我共享一下屏幕，带大家过一遍数据。' },
      { en: 'Sorry to interrupt, but I want to make sure I follow that point.', zh: '抱歉打断，我想确认一下我跟上了这个观点。' },
      { en: 'Let me play devil’s advocate for a second — what if usage doesn’t grow?', zh: '我来唱个反调——如果用户量不增长会怎样？' },
      { en: 'I’ll send out a summary with owners and deadlines after the call.', zh: '会后我会发一份带责任人和截止日的纪要。' }
    ],
    paragraph: {
      title: 'The Structure of a Good Update',
      en: 'A strong status update follows a simple three-part structure: what has changed, what is blocked, and what you need. Most people fail at the third part. They describe their work in detail and then stop, leaving the listener to guess whether help is required. Stating your ask explicitly — "I need a decision on pricing by Wednesday" — turns a report into a request, and requests are what actually move projects forward.',
      zh: '一份出色的进展汇报遵循简单的三段结构：什么发生了变化、什么被卡住了、你需要什么。大多数人败在第三部分。他们详细描述自己的工作然后就停了，留听众去猜是否需要帮忙。明确说出你的诉求——「我需要在周三前拿到定价决策」——能把一份报告变成一个请求，而请求才是真正推动项目前进的东西。'
    },
    dialogue: [
      { role: 'Lead', en: 'Let’s do a quick round. Jiya, want to start?', zh: '我们快速过一轮。Jiya，你先开始？' },
      { role: 'Jiya', en: 'Sure. Last week I finished the onboarding flow and shipped it to beta.', zh: '好的。上周我完成了新手引导流程并发到了 beta。' },
      { role: 'Lead', en: 'Nice. Any blockers?', zh: '不错。有什么阻塞吗？' },
      { role: 'Jiya', en: 'One — I’m still waiting on the copy from marketing.', zh: '有一个——我还在等市场部的文案。' },
      { role: 'Lead', en: 'I’ll chase that today. Anything you need from me?', zh: '我今天去催。还有什么需要我做的吗？' },
      { role: 'Jiya', en: 'A decision on whether we localize before launch would help.', zh: '如果能定下上线前是否做本地化，会很有帮助。' }
    ],
    tips: [
      '汇报三段式：What changed → What’s blocked → What I need。',
      '打断别人用 "Sorry to jump in" 或 "Quick question on that" 更礼貌。',
      '会议结尾一定要有 action items + owner + deadline 三要素。'
    ]
  },
  {
    id: 'product',
    theme: '产品经理英语 Product',
    emoji: '🧩',
    level: '高阶',
    phrases: [
      { en: 'Product-market fit (PMF)', zh: '产品市场匹配' },
      { en: 'North star metric', zh: '北极星指标' },
      { en: 'Edge case', zh: '边缘场景' },
      { en: 'Trade-off', zh: '取舍' },
      { en: 'Nice-to-have vs. must-have', zh: '锦上添花 vs. 必须有' },
      { en: 'Dogfooding', zh: '内部先行试用自家产品' }
    ],
    sentences: [
      { en: 'What problem are we actually solving, and for whom?', zh: '我们究竟在为谁解决什么问题？' },
      { en: 'This feature is a nice-to-have; let’s not let it block the release.', zh: '这个功能属于锦上添花，别让它阻塞发布。' },
      { en: 'The data suggests users drop off right after the second step.', zh: '数据显示用户在第二步之后就流失了。' },
      { en: 'We’re optimizing for retention, not for signups.', zh: '我们优化的是留存，不是注册量。' },
      { en: 'Let’s validate this with five user interviews before writing any code.', zh: '在写代码之前，先用五个用户访谈验证一下。' },
      { en: 'Every feature we add is a trade-off against simplicity.', zh: '我们每加一个功能，都是在牺牲简洁性。' }
    ],
    paragraph: {
      title: 'Saying No Is the Job',
      en: 'A product manager’s most valuable skill is not generating ideas — it is declining them. Every roadmap is a finite budget of attention, and each accepted request quietly borrows from something else. The hard part is that saying no rarely feels productive in the moment. But a product that tries to serve everyone ends up serving no one particularly well, and the discipline to protect focus is what separates a coherent product from a feature graveyard.',
      zh: '产品经理最有价值的能力不是产出想法，而是拒绝想法。每一份路线图都是一笔有限的注意力预算，每接受一个需求，都在悄悄从别处借走资源。困难之处在于，说「不」在当下几乎从不让人觉得有产出。但一个试图服务所有人的产品，最终对谁都服务得不够好，而守住焦点的这份克制，正是一个连贯的产品与一座功能坟场之间的区别。'
    },
    dialogue: [
      { role: 'Sales', en: 'A big client is asking for a custom dashboard. Can we build it?', zh: '有个大客户想要定制看板，我们能做吗？' },
      { role: 'PM', en: 'Help me understand the underlying need first. What are they trying to see?', zh: '先帮我理解底层需求。他们想看到什么？' },
      { role: 'Sales', en: 'Mostly weekly usage by team.', zh: '主要是按团队看周使用量。' },
      { role: 'PM', en: 'Then a filter on the existing report might solve it without a new build.', zh: '那在现有报表上加个筛选可能就能解决，不用新建。' },
      { role: 'Sales', en: 'That could work. How fast can we ship that?', zh: '这可行。多快能上线？' },
      { role: 'PM', en: 'Two weeks, and it benefits every customer instead of just one.', zh: '两周，而且这能让所有客户受益，而不只是一个。' }
    ],
    tips: [
      '面试常问：Tell me about a time you said no to a stakeholder。提前准备一个 STAR 结构的故事。',
      'PRD 里 must-have / should-have / nice-to-have 分级，是英文语境的通用写法。',
      '用 "Help me understand the underlying need" 挖真实需求，比直接拒绝有效得多。'
    ]
  },
  {
    id: 'opinions',
    theme: '表达观点 Opinions',
    emoji: '💬',
    level: '进阶',
    phrases: [
      { en: 'From my perspective', zh: '在我看来' },
      { en: 'I’d argue that', zh: '我认为 / 我会主张' },
      { en: 'That said', zh: '话虽如此' },
      { en: 'It boils down to', zh: '归根结底在于' },
      { en: 'I’m on the fence about', zh: '我对……还在摇摆' },
      { en: 'Correct me if I’m wrong', zh: '如果我说错了请纠正我' }
    ],
    sentences: [
      { en: 'I’d argue the real bottleneck isn’t speed — it’s clarity.', zh: '我认为真正的瓶颈不是速度，而是清晰度。' },
      { en: 'That said, I can see why you’d prefer the simpler approach.', zh: '话虽如此，我明白你为什么更倾向于简单的方案。' },
      { en: 'It boils down to whether we optimize for today or for next year.', zh: '归根结底在于我们是为当下还是为明年做优化。' },
      { en: 'I’m on the fence about this — could you walk me through the downside?', zh: '我对此还在摇摆，你能讲讲潜在的坏处吗？' },
      { en: 'I used to think that too, until I saw the retention data.', zh: '我以前也这么认为，直到我看到留存数据。' },
      { en: 'Let’s separate what we know from what we’re assuming.', zh: '我们把已知的和假设的区分开。' }
    ],
    paragraph: {
      title: 'Strong Opinions, Loosely Held',
      en: 'The phrase "strong opinions, loosely held" describes a way of thinking that many teams aspire to but few practice. It means committing hard enough to an idea that you can test it properly, while staying willing to abandon it the moment better evidence appears. The failure mode on one side is endless hedging that produces no decision; on the other, it is defending a position long after the facts have moved. Good judgment lives in the narrow space between the two.',
      zh: '「观点鲜明，但不固执」描述了一种许多团队向往却少有人实践的思维方式。它意味着对一个想法投入到足以认真检验它的程度，同时保持一旦出现更好的证据就立刻放弃它的意愿。一侧的失败模式是无休止的模棱两可，产生不了任何决策；另一侧则是在事实早已改变之后仍在死守立场。好的判断力，就活在这两者之间那道狭窄的空间里。'
    },
    dialogue: [
      { role: 'A', en: 'I think we should rebuild the whole thing from scratch.', zh: '我觉得我们应该整个推倒重来。' },
      { role: 'B', en: 'Correct me if I’m wrong, but wouldn’t that cost us six months?', zh: '如果我理解有误请指正，但那不是要花六个月吗？' },
      { role: 'A', en: 'Roughly, yes. But the current code is slowing every new feature.', zh: '大概是。但现在的代码拖慢了每个新功能。' },
      { role: 'B', en: 'That’s a fair point. Could we refactor incrementally instead?', zh: '有道理。我们能不能改成渐进式重构？' },
      { role: 'A', en: 'Possibly. It boils down to how much risk we can absorb.', zh: '也许可以。归根结底看我们能承受多少风险。' },
      { role: 'B', en: 'Let’s map out both options and compare them next week.', zh: '我们把两个方案都列出来，下周对比一下。' }
    ],
    tips: [
      '表达不同意见时，先承认对方合理的部分（"That’s a fair point"），再展开。',
      '"I used to think X, until Y" 是很有说服力的句式，展示你是被证据说服的。',
      '避免绝对化词汇 always / never，英语讨论中容易显得不够严谨。'
    ]
  },
  {
    id: 'daily-life',
    theme: '生活场景 Daily Life',
    emoji: '☕',
    level: '入门',
    phrases: [
      { en: 'For here or to go?', zh: '堂食还是外带？' },
      { en: 'Could I get a...', zh: '我要一份……（点餐最自然的说法）' },
      { en: 'Keep the change.', zh: '不用找了。' },
      { en: 'I’m just browsing.', zh: '我只是随便看看。' },
      { en: 'Does this come in another size?', zh: '这个有别的尺码吗？' },
      { en: 'Can I get a refill?', zh: '可以续杯吗？' }
    ],
    sentences: [
      { en: 'Could I get a medium oat milk latte, not too hot?', zh: '我要一杯中杯燕麦拿铁，别太烫。' },
      { en: 'Is there a table by the window available?', zh: '有靠窗的座位吗？' },
      { en: 'I’d like to return this — I have the receipt right here.', zh: '我想退这个，收据在这儿。' },
      { en: 'Do you take mobile payments?', zh: '你们支持手机支付吗？' },
      { en: 'Sorry, I think there’s been a mistake with my order.', zh: '不好意思，我的订单好像出了点问题。' },
      { en: 'Could you point me toward the nearest subway station?', zh: '能告诉我最近的地铁站怎么走吗？' }
    ],
    paragraph: {
      title: 'Politeness Is Grammar',
      en: 'In everyday English, politeness is carried less by adding the word "please" and more by choosing a softer grammatical form. "Give me a coffee" and "Could I get a coffee?" request exactly the same thing, but the second turns a command into a question, which leaves the other person room to respond. Once you notice this pattern, you start hearing it everywhere: modal verbs like could, would, and might are the quiet machinery of courtesy.',
      zh: '在日常英语中，礼貌与其说靠加一个 please，不如说靠选择更柔和的语法形式。"Give me a coffee" 和 "Could I get a coffee?" 请求的是完全相同的东西，但后者把命令变成了疑问，给对方留出了回应的余地。一旦你注意到这个规律，就会到处都听到它：could、would、might 这类情态动词，正是礼貌背后那套安静运转的机械装置。'
    },
    dialogue: [
      { role: 'Barista', en: 'Hi there, what can I get for you?', zh: '你好，需要点什么？' },
      { role: 'Jiya', en: 'Could I get a medium latte with oat milk, please?', zh: '麻烦来一杯中杯燕麦拿铁。' },
      { role: 'Barista', en: 'Sure. For here or to go?', zh: '好的。堂食还是带走？' },
      { role: 'Jiya', en: 'For here, thanks. Do you have any pastries left?', zh: '堂食，谢谢。还有点心吗？' },
      { role: 'Barista', en: 'We’ve got croissants and a blueberry muffin.', zh: '有可颂和一个蓝莓玛芬。' },
      { role: 'Jiya', en: 'I’ll take the croissant. That’s everything.', zh: '来个可颂吧，就这些。' }
    ],
    tips: [
      '点餐说 "Could I get..." 比 "I want..." 自然一百倍。',
      '听不懂时说 "Sorry?" 比 "What?" 礼貌，语调要上扬。',
      '"That’s everything" / "That’ll be all" 表示点完了。'
    ]
  },
  {
    id: 'fitness',
    theme: '运动健康 Fitness',
    emoji: '🏃',
    level: '入门',
    phrases: [
      { en: 'Work out', zh: '锻炼' },
      { en: 'Warm up / Cool down', zh: '热身 / 放松' },
      { en: 'Sore muscles', zh: '肌肉酸痛' },
      { en: 'Hit the gym', zh: '去健身房' },
      { en: 'Push through it', zh: '咬牙坚持过去' },
      { en: 'Rest day', zh: '休息日' }
    ],
    sentences: [
      { en: 'I try to work out four times a week, mostly strength training.', zh: '我尽量一周锻炼四次，主要是力量训练。' },
      { en: 'My shoulders are still sore from yesterday’s session.', zh: '昨天练完到现在肩膀还酸。' },
      { en: 'Don’t skip the warm-up — that’s how people get injured.', zh: '别跳过热身，很多人就是这样受伤的。' },
      { en: 'I’m trying to build a habit rather than chase results.', zh: '我想建立的是习惯，而不是追求结果。' },
      { en: 'Swimming is easier on the joints than running.', zh: '游泳比跑步对关节更友好。' },
      { en: 'Consistency matters far more than intensity.', zh: '规律性远比强度重要。' }
    ],
    paragraph: {
      title: 'Showing Up Beats Optimizing',
      en: 'Most people who fail at fitness do not fail because their program was suboptimal. They fail because they stopped showing up. A mediocre routine performed three times a week for a year will outperform a perfect routine abandoned after six weeks, every single time. This is not an argument against planning; it is a reminder that adherence is itself a variable, and usually the one with the largest coefficient.',
      zh: '大多数人在健身上失败，并不是因为训练计划不够优。他们失败是因为不再出现在健身房。一套平庸的动作，每周做三次坚持一年，每一次都会胜过一套六周后就被放弃的完美方案。这不是反对做计划，而是提醒你：坚持本身就是一个变量，而且通常是系数最大的那个。'
    },
    dialogue: [
      { role: 'A', en: 'You’ve been pretty consistent lately. What’s your routine?', zh: '你最近挺规律的，你的计划是什么？' },
      { role: 'B', en: 'Swimming on Monday, upper body Tuesday, legs Thursday.', zh: '周一游泳，周二上肢，周四腿。' },
      { role: 'A', en: 'That’s solid. Do you take rest days seriously?', zh: '安排得不错。你会认真休息吗？' },
      { role: 'B', en: 'I do now. I used to push through and ended up injured.', zh: '现在会了。我以前硬撑，结果受伤了。' },
      { role: 'A', en: 'Same. Recovery is half the training.', zh: '我也是。恢复是训练的一半。' },
      { role: 'B', en: 'Exactly. Consistency over intensity.', zh: '没错，规律胜过强度。' }
    ],
    tips: [
      '"work out" 是动词（两个词），"workout" 是名词（一个词），别写错。',
      '描述酸痛用 sore，不要用 painful（那是受伤级别的疼）。',
      '边运动边跟读这些句子，能同时训练发音和呼吸控制。'
    ]
  },
  {
    id: 'travel',
    theme: '出行旅游 Travel',
    emoji: '✈️',
    level: '入门',
    phrases: [
      { en: 'Check in / Check out', zh: '入住 / 退房' },
      { en: 'Aisle or window seat?', zh: '过道还是靠窗座位？' },
      { en: 'Carry-on luggage', zh: '随身行李' },
      { en: 'Layover', zh: '中转停留' },
      { en: 'Off the beaten path', zh: '小众、非热门的地方' },
      { en: 'Jet lag', zh: '时差反应' }
    ],
    sentences: [
      { en: 'I have a six-hour layover in Singapore.', zh: '我在新加坡中转停留六小时。' },
      { en: 'Is breakfast included in the room rate?', zh: '房费包含早餐吗？' },
      { en: 'Could I leave my luggage here until the afternoon?', zh: '我能把行李寄存到下午吗？' },
      { en: 'What’s a good spot that’s off the beaten path?', zh: '有什么比较小众的好地方推荐吗？' },
      { en: 'I’m still adjusting to the jet lag.', zh: '我还在倒时差。' },
      { en: 'Does the price include the service charge?', zh: '这个价格含服务费吗？' }
    ],
    paragraph: {
      title: 'Travel as Deliberate Disorientation',
      en: 'Travel works on us because it removes the scaffolding of routine. At home, most decisions are made automatically — which route, which shop, which words. Abroad, that automation breaks down, and you are forced back into conscious attention. This is uncomfortable, and it is precisely the point. The disorientation is not a side effect of travel; it is the mechanism by which travel changes how you see the place you came from.',
      zh: '旅行之所以对我们起作用，是因为它拆掉了日常的脚手架。在家里，大多数决定都是自动完成的——走哪条路、进哪家店、说哪句话。到了异地，这套自动化失效了，你被迫回到有意识的注意状态。这不舒服，而这恰恰是关键所在。迷失感不是旅行的副作用，它正是旅行改变你看待来处的方式的那套机制。'
    },
    dialogue: [
      { role: 'Front desk', en: 'Good evening. Do you have a reservation?', zh: '晚上好，请问有预订吗？' },
      { role: 'Jiya', en: 'Yes, under Jiya. Two nights, checking out Sunday.', zh: '有的，Jiya 的名字。住两晚，周日退房。' },
      { role: 'Front desk', en: 'Perfect. Could I see your passport, please?', zh: '好的，可以出示一下护照吗？' },
      { role: 'Jiya', en: 'Here you go. Is breakfast included?', zh: '给你。包含早餐吗？' },
      { role: 'Front desk', en: 'It is, from seven to ten on the second floor.', zh: '包含的，七点到十点，在二楼。' },
      { role: 'Jiya', en: 'Great. And is there Wi-Fi in the room?', zh: '好的。房间里有 Wi-Fi 吗？' }
    ],
    tips: [
      '酒店场景高频动词：check in, check out, book, cancel, upgrade。',
      '问路先说 "Excuse me, sorry to bother you" 会得到更热情的回应。',
      '把这组对话录下来对比原音，重点听连读：check-in → "che-kin"。'
    ]
  },
  {
    id: 'emotions',
    theme: '情绪表达 Emotions',
    emoji: '🌤',
    level: '进阶',
    phrases: [
      { en: 'Feeling overwhelmed', zh: '感到不堪重负' },
      { en: 'Burned out', zh: '倦怠、耗尽了' },
      { en: 'In a good headspace', zh: '心理状态不错' },
      { en: 'Take it personally', zh: '往心里去' },
      { en: 'Cut yourself some slack', zh: '对自己宽容一点' },
      { en: 'It’s been weighing on me', zh: '这事一直压着我' }
    ],
    sentences: [
      { en: 'I’ve been feeling a bit burned out lately — I think I need a real break.', zh: '我最近有点倦怠，我想我需要真正休息一下。' },
      { en: 'Don’t take it personally; the feedback was about the work, not about you.', zh: '别往心里去，反馈针对的是工作，不是你这个人。' },
      { en: 'It’s been weighing on me for weeks, and I finally talked to someone about it.', zh: '这事压了我好几周，我终于找人聊了。' },
      { en: 'Cut yourself some slack — you’ve been doing the work of two people.', zh: '对自己宽容点，你一直在干两个人的活。' },
      { en: 'I’m in a much better headspace than I was last month.', zh: '我的状态比上个月好多了。' },
      { en: 'I appreciate you checking in on me.', zh: '谢谢你来关心我。' }
    ],
    paragraph: {
      title: 'Naming the Feeling',
      en: 'Research on emotional regulation keeps arriving at the same unglamorous finding: putting a feeling into words reduces its intensity. Saying "I am anxious about the deadline" activates a different part of the brain than simply feeling anxious does. The vocabulary you have available therefore shapes what you can process. This is one of the quieter arguments for learning a language deeply — precision in naming your states is precision in managing them.',
      zh: '关于情绪调节的研究反复得出同一个并不炫目的结论：把感受说成语言，会降低它的强度。说出「我对这个截止日期感到焦虑」，激活的大脑区域与单纯感到焦虑并不相同。因此，你手上拥有的词汇，塑造了你能处理的东西。这也是深入学一门语言的一个更安静的理由——命名自己状态时的精确度，就是管理它们时的精确度。'
    },
    dialogue: [
      { role: 'A', en: 'You seem a bit off today. Everything okay?', zh: '你今天看起来有点不对劲，还好吗？' },
      { role: 'B', en: 'Honestly, I’ve been pretty overwhelmed this week.', zh: '说实话，我这周一直感觉喘不过气。' },
      { role: 'A', en: 'That makes sense — you’ve had a lot on your plate.', zh: '可以理解，你手上事情太多了。' },
      { role: 'B', en: 'Yeah. I think I need to say no to a few things.', zh: '是的，我觉得我得拒绝一些事情了。' },
      { role: 'A', en: 'That sounds healthy. Let me know if I can take something off your list.', zh: '这挺健康的。如果我能帮你分担什么就告诉我。' },
      { role: 'B', en: 'Thanks. I really appreciate you checking in.', zh: '谢谢，真的很感谢你来关心我。' }
    ],
    tips: [
      '"You seem a bit off" 是关心他人的高情商开场，比 "What’s wrong" 温和。',
      '英语中描述情绪多用形容词 + 介词：anxious about, frustrated with, excited for。',
      '每天用英语写一句「今天的感受」，是最低成本的输出练习。'
    ]
  },
  {
    id: 'interview',
    theme: '面试自荐 Interview',
    emoji: '🎯',
    level: '高阶',
    phrases: [
      { en: 'Walk me through your background', zh: '介绍一下你的经历' },
      { en: 'Ramp up quickly', zh: '快速上手' },
      { en: 'Own the outcome', zh: '对结果负责' },
      { en: 'Cross-functional', zh: '跨职能的' },
      { en: 'Drive impact', zh: '创造实际影响' },
      { en: 'Room for growth', zh: '成长空间' }
    ],
    sentences: [
      { en: 'I led a cross-functional team of six to launch the product in three months.', zh: '我带领一个六人跨职能团队在三个月内完成了产品上线。' },
      { en: 'The biggest lesson was that I underestimated how much alignment costs.', zh: '最大的教训是我低估了达成共识所需要的成本。' },
      { en: 'I’m looking for a role where I can own the outcome, not just the output.', zh: '我在找一个能对结果负责，而不只是交付产出的岗位。' },
      { en: 'What does success look like in this role after six months?', zh: '这个岗位在半年后的成功标准是什么？' },
      { en: 'I ramp up quickly — in my last role I shipped my first feature in week two.', zh: '我上手很快，上一份工作第二周就发布了第一个功能。' },
      { en: 'Could you tell me more about how the team makes decisions?', zh: '能多讲讲团队是如何做决策的吗？' }
    ],
    paragraph: {
      title: 'Answer in Stories, Not Adjectives',
      en: 'Interviewers discount adjectives almost automatically. Telling someone you are detail-oriented costs nothing and proves nothing, which is why every candidate says it. A specific story does the opposite work: it supplies evidence and lets the listener draw the conclusion themselves. Describe the situation, the constraint you faced, the decision you made, and what actually happened — including the part where it did not go perfectly. Credibility comes from the imperfection.',
      zh: '面试官几乎会自动地对形容词打折。告诉别人你「注重细节」既没有成本也证明不了什么，所以每个候选人都这么说。一个具体的故事做的是相反的功课：它提供证据，让听者自己得出结论。描述当时的情境、你面对的约束、你做的决定，以及实际发生了什么——包括没那么完美的那部分。可信度恰恰来自那点不完美。'
    },
    dialogue: [
      { role: 'Interviewer', en: 'Tell me about a project you’re proud of.', zh: '讲一个你引以为傲的项目。' },
      { role: 'Jiya', en: 'Sure. Last year I rebuilt our onboarding flow. Activation was at 34%.', zh: '好的。去年我重做了新手引导流程，当时激活率是 34%。' },
      { role: 'Interviewer', en: 'What did you change?', zh: '你做了什么改动？' },
      { role: 'Jiya', en: 'I cut the flow from seven steps to three after watching ten user sessions.', zh: '我看了十场用户录屏后，把流程从七步砍到三步。' },
      { role: 'Interviewer', en: 'And the result?', zh: '结果呢？' },
      { role: 'Jiya', en: 'Activation went to 52% in six weeks. Though retention barely moved — that surprised me.', zh: '六周内激活率提到 52%。不过留存几乎没变，这让我很意外。' }
    ],
    tips: [
      'STAR 结构：Situation → Task → Action → Result，每个故事控制在 90 秒内。',
      '一定要带数字。「提升了很多」在英文面试里等于没说。',
      '反问环节准备 3 个问题，问决策方式和成功标准比问福利更加分。'
    ]
  }
]

/** 按日期轮换今日推荐单元 */
export function getTodayLesson(date = new Date()): EnglishLesson {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return ENGLISH_LESSONS[dayOfYear % ENGLISH_LESSONS.length]
}
