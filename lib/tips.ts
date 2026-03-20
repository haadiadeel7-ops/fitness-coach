const TIPS = [
  "Progressive overload is the #1 driver of strength. Add weight or a rep every week.",
  "Sleep is when you grow. 7-9 hours per night is as important as your training.",
  "Protein synthesis peaks 30-60 min post-workout. Make that meal count.",
  "The best workout is the one you actually do. Consistency beats perfection every time.",
  "Compound lifts (squat, deadlift, bench) give you the most return per minute trained.",
  "Even 2% dehydration can drop your performance. Stay on top of water intake.",
  "Rest days aren't laziness -- they're when adaptation happens. Earn them.",
  "Form first, weight second. Bad form limits gains and guarantees injury.",
  "Cardio doesn't kill gains -- a caloric deficit does. Know the difference.",
  "Nutrition is 70% of the result. You can't out-train a bad diet.",
  "Train your weaknesses first when energy is highest. That's how gaps close.",
  "The last 2 reps of a set are where real adaptation happens. Don't quit early.",
  "Stretching post-workout reduces DOMS and improves mobility over time.",
  "Your mind quits before your muscles do. Learn to tell discomfort from pain.",
];

export function getTipOfTheDay(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % TIPS.length;
  return TIPS[dayIndex];
}
