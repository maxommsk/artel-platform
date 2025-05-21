const fs = require('fs');
const path = './src/app/api/calculator/route.ts';

let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  /const baseTermMonths = .*?;\s+const savedMonths = .*?;/s,
  `
const baseTermMonths = Math.min(
  tariff.max_term_months,
  Math.ceil((data.property_price - initialPaymentAmount) / monthlyPaymentAmount)
);

const accelerationEffect = data.new_members_count * tariff.acceleration_coefficient;

const acceleratedTermMonths = Math.max(
  1,
  Math.round(baseTermMonths * (1 - accelerationEffect))
);

const savedMonths = baseTermMonths - acceleratedTermMonths;
`.trim()
);

fs.writeFileSync(path, code);
console.log('✅ route.ts updated: переменные расставлены в правильном порядке.');
