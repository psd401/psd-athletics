# Writing and localization

## Voice by surface

| Surface | Voice | Example |
| --- | --- | --- |
| Agent turns | First person, brief, concrete | "I found 18 schedule fits. I have not changed the schedule." |
| Questions from the agent | One question, options as chips | "What should 'baseline' mean?" |
| Room titles | A plain question or outcome | "What changed after the letter?" |
| Rail promises | Two short beats | "A better number. A careful claim." |
| Buttons | Verb + object | "Apply 18 moves", "Build a comparison" |
| Trust footer | Facts joined by · | "Draft only · no student names shown · nothing shared" |
| Errors | What happened + how to fix | "Calendar sync failed. Showing data as of 7:01 AM." |
| Family-facing drafts | Warm, direct, grade 6–8 | "We want to hear from you." |

## Rules

- Sentence case everywhere; uppercase only through the `eyebrow` style.
- Numbers: use numerals and thousands separators (1,842); percentage points as "pp" or "points", never "%" for differences; ranges with an en dash (6:00–7:30 PM).
- Time: relative for recency ("4 days ago"), absolute for deadlines ("by 2:00").
- People: first names in rooms, initials on schedules, and no student names unless the room's scope allows them.
- Avoid "simply", "just", hype, emoji and exclamation points. Agents never apologize at length; they say what changed.

## Localization

- Families receive drafts in their language. English and Spanish are first-class: every family-facing draft offers "Checking Spanish translation" as a work step, and a person approves both versions.
- Allow 30–40% text expansion. Buttons and chips wrap rather than truncate.
- Use locale-aware number, date and time formatting (`Intl` on web, `FormatStyle` on Apple platforms).
- Mirror layouts for right-to-left languages: the rail moves to the right, and chevrons and arrows flip. Charts keep time running left to right.
- Set `lang` on every translated block so screen readers switch voice.
