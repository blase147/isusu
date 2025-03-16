export const tiers = [
    {
        id: 1,
        name: 'Tier 1',
        price: 1000,
        visibility: {
            walletBalance: 'Visible to all members',
            transactions: 'Visible to all members',
        },
        permissions: {
            withdrawals: 'Limited',
            admins: 1,
            loanAccess: false,
            investmentOpportunities: false,
        }
    },
    {
        id: 2,
        name: 'Tier 2',
        price: 3000,
        visibility: {
            walletBalance: 'Visible to only Admin',
            transactions: 'Withdrawals visible to only Admin',
        },
        permissions: {
            admins: 1,
            loanAccess: true,
            investmentOpportunities: false,
        }
    },
    {
        id: 3,
        name: 'Tier 3',
        price: 5000,
        visibility: {
            walletBalance: 'Visible to all members',
            transactions: 'All group transactions visible to all members',
        },
        permissions: {
            withdrawals: 'Standard',
            admins: 3, // Three executives
            signatories: 3,
            loanAccess: true,
            investmentOpportunities: false,
        }
    },
    {
        id: 4,
        name: 'Tier 4',
        price: 10000,
        visibility: {
            walletBalance: 'Not visible to all members',
            transactions: 'Withdrawals not visible except to Admins/Executives',
        },
        permissions: {
            withdrawals: 'Flexible',
            admins: 3, // Three executives
            signatories: 3,
            loanAccess: true,
            investmentOpportunities: true,
        }
    }
];

export default tiers;
