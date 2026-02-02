export type LeadAnswers = {
    timeline: 'IMMEDIATE' | '1-2_MONTHS' | '3_PLUS_MONTHS';
    has_portfolio: boolean;
    capital_type: 'CASH' | 'BOND' | 'BOTH';
    cash_amount?: 'R5M+' | 'R2.5M-R4.9M' | 'R1M-R2.49M' | 'R500K-R999K' | 'R100K-R499K' | '<R100K';
    bond_amount?: 'R5M+' | 'R3M-R4.9M' | 'R1.5M-R2.99M' | 'R750K-R1.49M' | 'R350K-R749K' | '<R350K';
    bond_preapproved?: boolean;
    risk_appetite: 1 | 2 | 3 | 4 | 5;
    has_experience: boolean;
};

export type LeadResult = {
    score: number;
    priority: 'HOT' | 'WARM' | 'COLD';
};

export function calculateLeadScore(answers: LeadAnswers): LeadResult {
    let score = 0;

    // 1. Timeline
    if (answers.timeline === 'IMMEDIATE') score += 3;
    else if (answers.timeline === '1-2_MONTHS') score += 2;
    else score += 1;

    // 2. Portfolio
    if (answers.has_portfolio) score += 2;

    // 3. Capital (Cash)
    if (answers.capital_type === 'CASH' || answers.capital_type === 'BOTH') {
        switch (answers.cash_amount) {
            case 'R5M+': score += 15; break;
            case 'R2.5M-R4.9M': score += 13; break;
            case 'R1M-R2.49M': score += 11; break;
            case 'R500K-R999K': score += 9; break;
            case 'R100K-R499K': score += 7; break;
            case '<R100K': score += 6; break;
        }
    }

    // 4. Capital (Bond)
    // Note: If BOTH, do we add both? User said "Capital availability... is split into two separate questions".
    // Assuming cumulative if they have both.
    if (answers.capital_type === 'BOND' || answers.capital_type === 'BOTH') {
        switch (answers.bond_amount) {
            case 'R5M+': score += 8; break;
            case 'R3M-R4.9M': score += 7; break;
            case 'R1.5M-R2.99M': score += 6; break;
            case 'R750K-R1.49M': score += 4; break;
            case 'R350K-R749K': score += 2; break;
            case '<R350K': score += 1; break;
        }

        if (answers.bond_preapproved) score += 5;
    }

    // 5. Risk Appetite
    if (answers.risk_appetite >= 4) score += 3;
    else if (answers.risk_appetite === 3) score += 2;
    else score += 1; // 1 or 2

    // 6. Experience
    if (answers.has_experience) score += 1;

    // Determine Priority
    let priority: 'HOT' | 'WARM' | 'COLD' = 'COLD';
    if (score >= 20) priority = 'HOT';
    else if (score >= 10) priority = 'WARM';

    return { score, priority };
}
