import type { EnglishLesson } from '../types'

/**
 * 内置英语学习资料库（1/2）：寒暄 / 职场 / 会议 / 产品 / 观点
 * 每个学习块都是「池」，界面分批展示，点刷新换下一批
 */
export const LESSONS_A: EnglishLesson[] = [
  // ══════════════════ 1. 日常寒暄 ══════════════════
  {
    id: 'small-talk',
    theme: '日常寒暄 Small Talk',
    emoji: '👋',
    level: '入门',
    desc: '陌生人破冰、老友重逢、电梯里两分钟不冷场',
    phrases: [
      { en: 'How’s it going?', zh: '最近怎么样？（比 How are you 更自然）' },
      { en: 'Long time no see.', zh: '好久不见。' },
      { en: 'What have you been up to?', zh: '你最近在忙什么？' },
      { en: 'Same here.', zh: '我也一样。' },
      { en: 'I’ll catch you later.', zh: '回头聊。' },
      { en: 'Take care.', zh: '保重。（告别常用）' },
      { en: 'Can’t complain.', zh: '还不错啦。（低调版「挺好的」）' },
      { en: 'How’s the family?', zh: '家里人都还好吧？' },
      { en: 'Small world!', zh: '世界真小！' },
      { en: 'I’ve got to run.', zh: '我得走了。（礼貌收尾）' },
      { en: 'Let’s keep in touch.', zh: '保持联系。' },
      { en: 'It’s been ages.', zh: '好久没见了。' }
    ],
    sentences: [
      { en: 'I’ve been swamped with work lately, but things are finally settling down.', zh: '我最近工作忙得不可开交，不过总算慢慢缓过来了。' },
      { en: 'The weather has been unusually warm for this time of year.', zh: '这个时节的天气暖和得有点反常。' },
      { en: 'I just moved to a new place, so I’m still getting used to the commute.', zh: '我刚搬了新住处，还在适应通勤。' },
      { en: 'We should grab coffee sometime and properly catch up.', zh: '我们找时间喝杯咖啡，好好聊聊。' },
      { en: 'Sorry, I didn’t catch that — could you say it again?', zh: '抱歉没听清，能再说一遍吗？' },
      { en: 'It was really nice running into you.', zh: '很高兴偶遇你。' },
      { en: 'I heard you started a new job — how’s that treating you?', zh: '听说你换了新工作，感觉怎么样？' },
      { en: 'Funny you should mention that, I was just thinking about it.', zh: '你提这个真巧，我刚好在想这件事。' },
      { en: 'I’m not much of a morning person, to be honest.', zh: '老实说，我不太是个早起的人。' },
      { en: 'Do you have any plans for the long weekend?', zh: '这个小长假你有什么安排吗？' },
      { en: 'I don’t want to keep you — I know you’re busy.', zh: '我就不耽误你了，知道你挺忙的。' },
      { en: 'Anyway, I should let you get back to it.', zh: '总之，你先忙吧。（自然的结束语）' }
    ],
    paragraphs: [
      {
        title: 'Why Small Talk Matters',
        en: 'Small talk is often dismissed as meaningless chatter, but it serves a real social function. It lowers the barrier between strangers and creates a safe space where deeper conversation can begin. A short exchange about the weather or the weekend signals that you are approachable and willing to engage. In professional settings, the two minutes before a meeting starts often build more trust than the meeting itself.',
        zh: '闲聊常被视为无意义的搭话，但它其实有真实的社交功能。它降低了陌生人之间的壁垒，创造出一个可以展开深度对话的安全空间。一段关于天气或周末的简短交流，传递出你平易近人、愿意交流的信号。在职场中，会议开始前的那两分钟，往往比会议本身建立起更多信任。'
      },
      {
        title: 'The Art of Ending a Conversation',
        en: 'Knowing how to leave a conversation is as valuable as knowing how to start one. The trick is to close the loop rather than simply walk away. Acknowledge what was said, add a forward-looking line, and then exit cleanly: "That sounds like a great project — let me know how it turns out. I should get going." People rarely remember what you talked about, but they always remember whether the ending felt abrupt or warm.',
        zh: '懂得如何结束一段对话，和懂得如何开启一段对话同样有价值。诀窍在于「收口」，而不是转身就走。先回应对方说过的内容，再加一句面向未来的话，然后干净利落地退场：「听起来是个很棒的项目——有进展了告诉我。我得走了。」人们很少记得你们聊了什么，但一定记得结尾是仓促还是温暖。'
      }
    ],
    dialogues: [
      [
        { role: 'A', en: 'Hey! Long time no see. How have you been?', zh: '嘿！好久不见，你怎么样？' },
        { role: 'B', en: 'Pretty good, thanks. Busy as always. How about you?', zh: '挺好的，谢谢。一如既往地忙。你呢？' },
        { role: 'A', en: 'Can’t complain. I just started a side project actually.', zh: '还不错。我最近开始做一个副业项目。' },
        { role: 'B', en: 'Oh really? What kind of project?', zh: '是吗？什么样的项目？' },
        { role: 'A', en: 'A little productivity app. Nothing fancy, but I’m enjoying it.', zh: '一个小的效率工具应用。没多复杂，但我做得挺开心。' },
        { role: 'B', en: 'That sounds great. Let’s grab coffee and you can tell me more.', zh: '听起来不错。改天喝咖啡，你再细讲给我听。' }
      ],
      [
        { role: 'A', en: 'Is this seat taken?', zh: '这位子有人吗？' },
        { role: 'B', en: 'No, go ahead. Are you here for the workshop too?', zh: '没有，请坐。你也是来参加工作坊的吗？' },
        { role: 'A', en: 'I am. I signed up last minute, honestly.', zh: '是的。说实话我是最后一刻才报的名。' },
        { role: 'B', en: 'Same. I only heard about it on Friday. What do you do?', zh: '我也是，周五才听说。你是做什么的？' },
        { role: 'A', en: 'I’m a product manager. Mostly working on internal tools.', zh: '我是产品经理，主要做内部工具。' },
        { role: 'B', en: 'Small world — I’m on the design side. We should stay in touch.', zh: '世界真小，我是做设计的。咱们保持联系吧。' }
      ]
    ],
    tips: [
      '寒暄的关键是「接话」而不是「答题」：回答后反问一句，对话才能继续。',
      '避免用 "I’m fine, thank you, and you?" 这种教科书式回答，太生硬。',
      '推荐影子跟读法：播放音频，延迟 1 秒跟读，重点模仿语调而非单词。'
    ]
  },

  // ══════════════════ 2. 职场沟通 ══════════════════
  {
    id: 'workplace',
    theme: '职场沟通 Workplace',
    emoji: '💼',
    level: '进阶',
    desc: '同步进展、拒绝需求、推动协作的地道说法',
    phrases: [
      { en: 'Circle back on this', zh: '稍后再回到这个话题' },
      { en: 'Loop someone in', zh: '把某人拉进讨论 / 抄送某人' },
      { en: 'Touch base', zh: '简短同步一下进展' },
      { en: 'On the same page', zh: '达成共识' },
      { en: 'Take ownership of', zh: '主动负责起某事' },
      { en: 'Bandwidth', zh: '（工作）精力 / 余力' },
      { en: 'Low-hanging fruit', zh: '容易拿下的成果' },
      { en: 'Move the needle', zh: '产生实质影响' },
      { en: 'Drop the ball', zh: '掉链子、把事搞砸' },
      { en: 'Give someone a heads-up', zh: '提前给某人打个招呼' },
      { en: 'Align on priorities', zh: '对齐优先级' },
      { en: 'Scope creep', zh: '需求范围失控膨胀' }
    ],
    sentences: [
      { en: 'Let me loop in the design team before we finalize this.', zh: '在敲定之前，我先把设计团队拉进来。' },
      { en: 'I don’t have the bandwidth to take this on this week.', zh: '这周我没有精力接这个活。' },
      { en: 'Just to make sure we’re on the same page — the deadline is next Friday, right?', zh: '确认一下我们理解一致——截止日是下周五，对吗？' },
      { en: 'Could you give me a quick status update by end of day?', zh: '你能在今天下班前简单同步一下进展吗？' },
      { en: 'I’d like to push back on that timeline — it’s not realistic given our current scope.', zh: '我想对这个时间表提出异议——按目前的范围来看不现实。' },
      { en: 'Let’s park that discussion and revisit it next sprint.', zh: '我们先搁置这个讨论，下个迭代再看。' },
      { en: 'Happy to help, but I’ll need to deprioritize something else.', zh: '我很乐意帮忙，但得先把别的事降优先级。' },
      { en: 'Just a heads-up: the API change may affect your module.', zh: '提前说一声：这次接口改动可能影响你的模块。' },
      { en: 'Can we timebox this to fifteen minutes?', zh: '我们把这个话题控制在十五分钟内好吗？' },
      { en: 'I’ll own this and report back on Thursday.', zh: '这件事我来负责，周四给大家反馈。' },
      { en: 'What’s the one thing that would unblock you right now?', zh: '现在最能帮你解除卡点的是什么？' },
      { en: 'Let’s document the decision so we don’t relitigate it later.', zh: '我们把这个决定记下来，免得以后反复讨论。' }
    ],
    paragraphs: [
      {
        title: 'Disagreeing Without Friction',
        en: 'In English-speaking workplaces, direct disagreement is usually softened by framing. Instead of saying "That’s wrong," people say "I see it a bit differently" or "Help me understand the reasoning here." This is not dishonesty; it is a way of separating the idea from the person holding it. The goal is to keep the discussion open long enough for the better argument to surface, rather than forcing an early winner.',
        zh: '在英语职场中，直接的反对通常会通过措辞来软化。人们不会说「那是错的」，而是说「我的看法稍有不同」或者「帮我理解一下这里的逻辑」。这不是虚伪，而是把观点和持有观点的人区分开的一种方式。目的是让讨论保持开放足够久，好让更优的论证浮现出来，而不是急着分出胜负。'
      },
      {
        title: 'Writing Emails People Actually Read',
        en: 'A good work email answers three questions in the first two lines: what this is about, what you need, and by when. Everything else is context that can wait until later in the message. Long preambles feel polite but they push the request out of view, and busy readers often reply to only the first thing they see. If your email needs a decision, say so explicitly and offer a default option — most people find it far easier to approve a proposal than to invent one.',
        zh: '一封好的工作邮件会在前两行回答三个问题：这封邮件关于什么、你需要什么、什么时候要。其他都是背景信息，可以放在后面。冗长的铺垫看似礼貌，却把真正的请求挤出了视线，而忙碌的读者往往只回复他们看到的第一件事。如果邮件需要对方拍板，就明说，并给出一个默认选项——对大多数人来说，批准一个方案远比从零想一个方案容易。'
      }
    ],
    dialogues: [
      [
        { role: 'PM', en: 'I think we should ship the feature this Friday.', zh: '我觉得我们应该这周五上线这个功能。' },
        { role: 'Dev', en: 'I see it a bit differently. We still have three open bugs.', zh: '我的看法有点不同，我们还有三个未解决的 bug。' },
        { role: 'PM', en: 'Fair point. Are any of them blockers?', zh: '有道理。其中有阻塞性的吗？' },
        { role: 'Dev', en: 'One is. The other two are cosmetic and can wait.', zh: '有一个是。另外两个只是样式问题，可以先放着。' },
        { role: 'PM', en: 'Okay — can we fix the blocker by Thursday and ship Friday?', zh: '好，那我们周四前修掉阻塞项，周五上线可以吗？' },
        { role: 'Dev', en: 'That works. I’ll keep you posted tomorrow morning.', zh: '可以。我明早跟你同步。' }
      ],
      [
        { role: 'A', en: 'Do you have a minute? I’d like to touch base on the launch plan.', zh: '有空吗？我想同步一下上线计划。' },
        { role: 'B', en: 'Sure, but I only have about ten minutes before my next call.', zh: '可以，不过下个会前我只有十分钟。' },
        { role: 'A', en: 'That’s plenty. The main thing is we’re seeing some scope creep.', zh: '够了。主要是我们的需求范围有点失控。' },
        { role: 'B', en: 'What got added that wasn’t in the original spec?', zh: '有哪些不在原始需求里的东西被加进来了？' },
        { role: 'A', en: 'Two dashboards and an export feature. Neither moves the needle for launch.', zh: '两个看板和一个导出功能，对上线都没什么实质帮助。' },
        { role: 'B', en: 'Agreed. Cut them and let’s document the decision so it doesn’t come back.', zh: '同意。砍掉，然后把决定记录下来，免得又被翻出来。' }
      ]
    ],
    tips: [
      '职场英语的核心不是词汇量，而是「软化 + 明确」：措辞客气，诉求清晰。',
      '拒绝时给替代方案（"I can do X instead"）比单纯说 no 更专业。',
      '会议里最有用的一句：Just to make sure we’re on the same page…'
    ]
  },

  // ══════════════════ 3. 会议表达 ══════════════════
  {
    id: 'meeting',
    theme: '会议表达 Meetings',
    emoji: '🗓',
    level: '进阶',
    desc: '开场、插话、追问、控场、收尾的完整会议话术',
    phrases: [
      { en: 'Let’s get started.', zh: '我们开始吧。' },
      { en: 'Can everyone hear me?', zh: '大家能听到我吗？' },
      { en: 'Sorry to interrupt, but…', zh: '抱歉打断一下，不过……' },
      { en: 'Just to build on that…', zh: '顺着这个再补充一点……' },
      { en: 'Let’s take that offline.', zh: '这个我们会后单独聊。' },
      { en: 'To recap…', zh: '简单回顾一下……' },
      { en: 'What are the action items?', zh: '待办事项有哪些？' },
      { en: 'I’ll take that as an action.', zh: '这件事我认领。' },
      { en: 'Can we get a quick temperature check?', zh: '大家能快速表个态吗？' },
      { en: 'Let’s hear from someone we haven’t heard from yet.', zh: '我们听听还没发言的同事。' },
      { en: 'We’re coming up on time.', zh: '时间快到了。' },
      { en: 'Any last thoughts before we wrap?', zh: '结束前还有什么补充吗？' }
    ],
    sentences: [
      { en: 'Thanks everyone for joining — we have thirty minutes and three items to cover.', zh: '感谢大家参会，我们有三十分钟、三个议题。' },
      { en: 'Before we dive in, does anyone have anything to add to the agenda?', zh: '在正式开始前，有人要补充议程吗？' },
      { en: 'I want to make sure I understood correctly — you’re saying the data is incomplete?', zh: '我想确认一下我理解对了——你是说数据不完整？' },
      { en: 'Could you walk us through how you arrived at that number?', zh: '你能带我们过一遍这个数字是怎么算出来的吗？' },
      { en: 'That’s a great point, but I’d like to keep us on the main topic for now.', zh: '这个观点很好，不过我想先把主线话题聊完。' },
      { en: 'Let me play devil’s advocate for a second.', zh: '我来唱个反调。' },
      { en: 'So the decision is to delay by one week — is everyone comfortable with that?', zh: '所以决定是延后一周——大家都能接受吗？' },
      { en: 'I’ll send out notes with the action items and owners this afternoon.', zh: '我下午会发出会议纪要，包含待办和负责人。' },
      { en: 'Can we park this and pick it up in next week’s review?', zh: '这个能先放一放，下周评审会再聊吗？' },
      { en: 'Just so I’m clear on the next step — who’s reaching out to the vendor?', zh: '我确认一下下一步——谁去联系供应商？' },
      { en: 'I don’t have strong feelings either way, so I’ll defer to the team.', zh: '我没有强烈倾向，听团队的。' },
      { en: 'Let’s end five minutes early and give everyone their time back.', zh: '我们提前五分钟结束，把时间还给大家。' }
    ],
    paragraphs: [
      {
        title: 'How to Interrupt Politely',
        en: 'In a fast-moving meeting, waiting for a natural pause can mean never speaking at all. The safest way in is to signal intent before making your point: "Can I jump in here for a second?" or "Sorry, quick question before we move on." Both phrases ask permission and take less than two seconds, which most speakers will grant without resentment. What people dislike is not the interruption itself, but the feeling of being cut off mid-thought without acknowledgment.',
        zh: '在节奏很快的会议里，等一个自然停顿往往意味着永远没机会发言。最稳妥的切入方式是先示意意图，再说观点：「我能插一句吗？」或「抱歉，往下走之前有个小问题。」这两句话都是在征求许可，耗时不到两秒，大多数发言者会欣然同意。人们反感的不是打断本身，而是话说到一半被硬生生切掉、还没被认可的那种感觉。'
      },
      {
        title: 'The Meeting That Should Have Been an Email',
        en: 'A meeting earns its place only when it needs live disagreement, real-time decision making, or the kind of trust that written words cannot build. If the purpose is to share information, a well-structured document will always be faster and more accurate, because readers can move at their own pace and go back to what they missed. Before you send the invite, ask what would go wrong if this were a document instead. If the honest answer is "nothing," you have your answer.',
        zh: '只有当一件事需要现场的分歧碰撞、需要即时拍板，或者需要建立文字无法建立的信任时，会议才配得上占用大家的时间。如果目的只是同步信息，一份结构清晰的文档永远更快也更准确，因为读者可以按自己的节奏推进、可以回看漏掉的部分。在发出会议邀请之前，先问一句：如果改成一份文档，会出什么问题？如果诚实的答案是「没什么」，那答案就已经很清楚了。'
      }
    ],
    dialogues: [
      [
        { role: 'Host', en: 'Alright, let’s get started. Today we’re deciding on the pricing model.', zh: '好，我们开始。今天要定价格模型。' },
        { role: 'A', en: 'Can I jump in before we do? I sent updated numbers this morning.', zh: '我能先插一句吗？我今早发了更新后的数据。' },
        { role: 'Host', en: 'Good catch. Could you walk us through the changes?', zh: '提得好。你能带我们过一下变化吗？' },
        { role: 'A', en: 'Sure. Churn is lower than we assumed, so tiered pricing looks safer.', zh: '好。流失率比我们预想的低，所以阶梯定价看起来更稳妥。' },
        { role: 'B', en: 'Let me play devil’s advocate — does that complicate the sales pitch?', zh: '我来唱个反调——这会不会让销售话术变复杂？' },
        { role: 'Host', en: 'Fair concern. Let’s take that offline and decide the model today.', zh: '这个顾虑合理。会后单独聊，今天先把模型定了。' }
      ],
      [
        { role: 'Host', en: 'We’re coming up on time. Any last thoughts before we wrap?', zh: '时间快到了，结束前还有补充吗？' },
        { role: 'A', en: 'Just to recap: we’re shipping on the 12th, and I own the release notes.', zh: '简单回顾：12 号上线，发布说明由我负责。' },
        { role: 'B', en: 'And I’ll reach out to the vendor by Wednesday.', zh: '我周三前联系供应商。' },
        { role: 'Host', en: 'Perfect. Anything unresolved that we should flag?', zh: '很好。还有什么没解决、需要标记出来的吗？' },
        { role: 'C', en: 'The legal review hasn’t started. That could slip us a week.', zh: '法务审核还没开始，可能会拖一周。' },
        { role: 'Host', en: 'Noted. I’ll escalate that today. Thanks everyone — ending early.', zh: '记下了，我今天就上报。谢谢大家，提前结束。' }
      ]
    ],
    tips: [
      '插话三件套：Can I jump in? / Sorry to interrupt / Quick question before we move on.',
      '会议收尾必说 action items + owner + deadline，三要素缺一不可。',
      '"Let’s take that offline" 是控场神句，既不否定对方也保住了议程。'
    ]
  },

  // ══════════════════ 4. 产品与需求 ══════════════════
  {
    id: 'product',
    theme: '产品与需求 Product',
    emoji: '🧩',
    level: '进阶',
    desc: '产品经理必备：讲需求、评优先级、做用户访谈',
    phrases: [
      { en: 'Pain point', zh: '痛点' },
      { en: 'Edge case', zh: '边界情况' },
      { en: 'Nice to have', zh: '锦上添花（非必需）' },
      { en: 'Must-have', zh: '必须要有的' },
      { en: 'User journey', zh: '用户旅程' },
      { en: 'Ship it', zh: '发布上线' },
      { en: 'Dogfooding', zh: '内部自己先用' },
      { en: 'Technical debt', zh: '技术债' },
      { en: 'Minimum viable product', zh: '最小可行产品（MVP）' },
      { en: 'Gut feeling vs. data', zh: '直觉判断 vs 数据依据' },
      { en: 'Sunset a feature', zh: '下线某个功能' },
      { en: 'North star metric', zh: '北极星指标' }
    ],
    sentences: [
      { en: 'What problem are we actually solving here?', zh: '我们到底在解决什么问题？' },
      { en: 'This feels like a nice-to-have rather than a must-have.', zh: '这个感觉是锦上添花，而不是必需项。' },
      { en: 'Let’s validate the assumption before we build anything.', zh: '在动手开发前，先验证这个假设。' },
      { en: 'Who is this for, and what do they do today instead?', zh: '这是给谁用的？他们现在是怎么解决的？' },
      { en: 'I’d rather ship something small and learn than guess for another month.', zh: '我宁愿先发一个小版本去学习，也不想再猜一个月。' },
      { en: 'The data says one thing, but the interviews say another.', zh: '数据说的是一回事，访谈说的是另一回事。' },
      { en: 'What would have to be true for this to work?', zh: '这个方案要成立，需要哪些前提成立？' },
      { en: 'Let’s cut scope, not quality.', zh: '我们砍范围，但不砍质量。' },
      { en: 'How will we know if this succeeded?', zh: '我们怎么判断这件事成功了？' },
      { en: 'That edge case affects maybe two percent of users — let’s handle it later.', zh: '那个边界情况大概影响 2% 的用户，先放后面处理。' },
      { en: 'I want to understand the "why" behind the request, not just the "what".', zh: '我想搞清楚这个需求背后的「为什么」，而不只是「要什么」。' },
      { en: 'If everything is a priority, nothing is.', zh: '如果什么都是优先级，那就等于没有优先级。' }
    ],
    paragraphs: [
      {
        title: 'Asking Better Questions in User Interviews',
        en: 'The most common mistake in user research is asking people to predict their own behaviour. Questions like "Would you use this feature?" almost always get a polite yes, because agreeing is easier than explaining. Skilled interviewers ask about the past instead: "Tell me about the last time you ran into this problem. What did you do?" Memory of real behaviour is imperfect, but it is far more reliable than imagination about a future that has not happened yet.',
        zh: '用户研究中最常见的错误，是让用户预测自己的行为。「你会用这个功能吗？」这类问题几乎总能得到一个客气的「会」，因为附和比解释容易得多。熟练的访谈者会转而追问过去：「说说你上一次遇到这个问题是什么时候？当时你怎么做的？」对真实行为的回忆虽然不完美，但远比对尚未发生的未来的想象可靠。'
      },
      {
        title: 'Saying No Is the Job',
        en: 'A product manager’s real leverage is not in the features they add but in the ones they refuse. Every yes consumes engineering time, adds surface area to maintain, and makes the product harder to explain. The hardest part is that most requests are individually reasonable — they come from real customers with real frustrations. Learning to say "not now, and here is what we are doing instead" is what separates a roadmap from a wish list.',
        zh: '产品经理真正的杠杆不在于加了多少功能，而在于拒绝了多少。每一次答应都会消耗研发时间、增加需要维护的面积，也让产品更难被解释清楚。最难的地方在于，大多数需求单看都合情合理——它们来自真实的客户和真实的挫败感。学会说「现在不做，我们正在做的是这些」，才是路线图和许愿清单的分水岭。'
      }
    ],
    dialogues: [
      [
        { role: 'PM', en: 'Tell me about the last time you had to export a report.', zh: '说说你上一次需要导出报表是什么时候。' },
        { role: 'User', en: 'Last Friday. I needed numbers for the board meeting.', zh: '上周五，我要给董事会准备数据。' },
        { role: 'PM', en: 'What did you do? Walk me through it step by step.', zh: '你当时怎么做的？一步步说给我听。' },
        { role: 'User', en: 'I copied three tables into a spreadsheet and fixed the formatting by hand.', zh: '我把三张表复制到表格里，然后手动调格式。' },
        { role: 'PM', en: 'How long did that take?', zh: '这花了多久？' },
        { role: 'User', en: 'Almost an hour. And I did the same thing the month before.', zh: '快一个小时。上个月我也是这么干的。' }
      ],
      [
        { role: 'Sales', en: 'This client will sign if we add a custom dashboard.', zh: '如果我们加个定制看板，这个客户就签约。' },
        { role: 'PM', en: 'What problem does the dashboard solve for them?', zh: '这个看板帮他们解决了什么问题？' },
        { role: 'Sales', en: 'They want to see weekly usage without asking us.', zh: '他们想不用问我们就能看到每周使用量。' },
        { role: 'PM', en: 'Then a weekly email report might solve it in a fraction of the time.', zh: '那一封每周使用报告邮件也许能用零头的时间解决。' },
        { role: 'Sales', en: 'Honestly, that could work. They just don’t want to chase us.', zh: '说实话，那也行。他们只是不想追着我们要。' },
        { role: 'PM', en: 'Let’s test that first. If they still want the dashboard, we’ll revisit.', zh: '那先试这个。如果他们还是要看板，我们再讨论。' }
      ]
    ],
    tips: [
      '访谈黄金句式：Tell me about the last time you… （问过去，不问将来）。',
      '拒绝需求时给出「not now + 我们在做什么」，比单纯说 no 更有说服力。',
      '"What would have to be true for this to work?" 是逼出隐藏假设的利器。'
    ]
  },

  // ══════════════════ 5. 观点表达 ══════════════════
  {
    id: 'opinions',
    theme: '观点表达 Opinions',
    emoji: '🗯',
    level: '进阶',
    desc: '有分寸地表达赞同、保留、质疑与改变立场',
    phrases: [
      { en: 'The way I see it…', zh: '在我看来……' },
      { en: 'I’m on the fence about this.', zh: '这件事我还在犹豫。' },
      { en: 'I couldn’t agree more.', zh: '我完全同意。' },
      { en: 'I take your point, but…', zh: '我理解你的观点，不过……' },
      { en: 'That’s a fair point.', zh: '这话有道理。' },
      { en: 'I’d argue the opposite.', zh: '我倒觉得恰恰相反。' },
      { en: 'It depends on how you define it.', zh: '这取决于你怎么定义。' },
      { en: 'To be fair…', zh: '公平地说……' },
      { en: 'I stand corrected.', zh: '我说错了，你是对的。' },
      { en: 'Correct me if I’m wrong…', zh: '如果我说错了请纠正我……' },
      { en: 'Let’s agree to disagree.', zh: '我们求同存异吧。' },
      { en: 'That changed my mind.', zh: '这一点改变了我的想法。' }
    ],
    sentences: [
      { en: 'I’m not entirely convinced, but I’m open to being persuaded.', zh: '我还没完全被说服，但我愿意听你说服我。' },
      { en: 'There’s something to be said for both approaches.', zh: '两种做法各有可取之处。' },
      { en: 'I used to think that too, until I saw the numbers.', zh: '我以前也这么想，直到我看到数据。' },
      { en: 'My concern is less about the idea and more about the timing.', zh: '我担心的不是这个想法本身，而是时机。' },
      { en: 'If I understand you correctly, you’re saying cost matters more than speed.', zh: '如果我理解得对，你是说成本比速度更重要。' },
      { en: 'That’s true in theory, but I’m not sure it holds in practice.', zh: '理论上是这样，但我不确定实践中是否成立。' },
      { en: 'I’d rather be roughly right than precisely wrong.', zh: '我宁愿大致正确，也不要精确地错。' },
      { en: 'Where I think we differ is on the assumption about demand.', zh: '我觉得我们的分歧在于对需求的假设。' },
      { en: 'Honestly, I don’t feel strongly enough to block it.', zh: '老实说，我的意见没强烈到要否决它。' },
      { en: 'Can you give me an example? I want to make sure I’m not misreading it.', zh: '能举个例子吗？我想确认自己没理解偏。' },
      { en: 'I’ll admit I was wrong about that.', zh: '我承认在这一点上我错了。' },
      { en: 'Let’s separate what we know from what we’re assuming.', zh: '我们把「已知」和「假设」区分开。' }
    ],
    paragraphs: [
      {
        title: 'Strong Opinions, Loosely Held',
        en: 'The phrase "strong opinions, loosely held" describes a way of thinking that is both decisive and humble. You commit to a position clearly enough that others can argue with it, but you remain willing to abandon it the moment better evidence appears. The failure modes are easy to spot: people who hold opinions too loosely never say anything useful, while people who hold them too tightly turn every discussion into a defence of their ego rather than a search for the truth.',
        zh: '「强观点，弱执念」描述的是一种既果断又谦逊的思维方式。你把立场表达得足够清晰，好让别人能够反驳它；但一旦出现更好的证据，你也愿意立刻放弃它。两种失败模式都很好辨认：执念太弱的人从来说不出有价值的话，而执念太强的人会把每一场讨论变成对自我的辩护，而不是对真相的探寻。'
      },
      {
        title: 'The Steel Man Argument',
        en: 'Before you refute an argument, try to restate it in a form stronger than the one you heard. This is called steel-manning, the opposite of attacking a straw man. It costs a few extra seconds, but it does two useful things at once: it proves you actually listened, and it protects you from winning against a version of the argument that nobody was making. Occasionally you will discover, halfway through building the stronger version, that you now agree with it.',
        zh: '在反驳一个论点之前，先试着把它复述成一个比你听到的更强的版本。这叫「钢铁人论证」，是「稻草人论证」的反面。它只多花几秒钟，却同时做成了两件有用的事：证明你真的在听，也避免你战胜的只是一个根本没人提出的版本。偶尔你会发现，在构建更强版本的过程中，自己已经被说服了。'
      }
    ],
    dialogues: [
      [
        { role: 'A', en: 'I think remote-first is clearly better for this team.', zh: '我觉得对这个团队来说，远程优先明显更好。' },
        { role: 'B', en: 'I take your point, but I’d argue onboarding suffers the most.', zh: '我理解你的观点，不过我认为受影响最大的是新人融入。' },
        { role: 'A', en: 'That’s a fair point. Do you have examples?', zh: '这话有道理。你有例子吗？' },
        { role: 'B', en: 'Our last two hires took twice as long to become productive.', zh: '我们最近两位新同事上手时间是过去的两倍。' },
        { role: 'A', en: 'Hmm. That changed my mind — at least for the first month.', zh: '嗯，这改变了我的想法——至少对第一个月来说。' },
        { role: 'B', en: 'Then maybe remote-first, but on-site for onboarding?', zh: '那也许是远程优先，但入职期到现场？' }
      ],
      [
        { role: 'A', en: 'Correct me if I’m wrong, but you’re against raising the price?', zh: '如果我说错了请纠正——你是反对涨价的？' },
        { role: 'B', en: 'Not against it. I’m on the fence about the timing.', zh: '不是反对，我是对时机拿不准。' },
        { role: 'A', en: 'What would make you comfortable?', zh: '什么条件下你会觉得踏实？' },
        { role: 'B', en: 'Seeing churn stay flat for one more quarter.', zh: '再看到一个季度流失率持平。' },
        { role: 'A', en: 'That’s reasonable. Let’s separate what we know from what we assume.', zh: '合理。我们把已知和假设分开来看。' },
        { role: 'B', en: 'Agreed. If the data holds, I’ll support it in April.', zh: '同意。如果数据稳住，四月我就支持。' }
      ]
    ],
    tips: [
      '表达异议的黄金结构：先承认（That’s a fair point）→ 再转折（but/however）→ 给依据。',
      '"I stand corrected" 是英语里非常体面的认错方式，比 "I was wrong" 更从容。',
      '反驳前先复述对方观点（steel man），既显专业又能避免误解。'
    ]
  }
]
