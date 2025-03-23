export type Tier = {
    id: number;
    name: string;
    price: number;
    visibility: {
        walletBalance: boolean;
        transactions: boolean;
    };
    permissions: {
        withdrawals: boolean;
        admins: boolean;
        signatories?: boolean;
        loanAccess: boolean;
        investmentOpportunities: boolean;
        makeAnnouncement?: boolean;
        editGroupSettings?: boolean;
        manageMembers?: boolean;
    };
};

export const tiers: Tier[] = [
    {
        id: 1,
        name: "Tier 1",
        price: 1000,
        visibility: {
            walletBalance: true, // Visible to all members
            transactions: true, // Visible to all members
        },
        permissions: {
            withdrawals: true, // Flexible withdrawals
            admins: false, // Three executives have admin rights
            signatories: false,
            loanAccess: false,
            investmentOpportunities: false,
            makeAnnouncement: false,
            editGroupSettings: false,
            manageMembers: false,
        },
    },
    {
        id: 2,
        name: "Tier 2",
        price: 3000,
        visibility: {
            walletBalance: true, // Not visible to all members
            transactions: false, // Withdrawals visible to only Admin
        },
        permissions: {
            withdrawals: true, // Flexible withdrawals
            admins: false, // Three executives have admin rights
            signatories: false,
            loanAccess: false,
            investmentOpportunities: false,
            makeAnnouncement: false,
            editGroupSettings: false,
            manageMembers: false,
        },
    },
    {
        id: 3,
        name: "Tier 3",
        price: 5000,
        visibility: {
            walletBalance: true, // Visible to all members
            transactions: false, // All transactions visible
        },
        permissions: {
            withdrawals: true, // Flexible withdrawals
            admins: true, // Three executives have admin rights
            signatories: true,
            loanAccess: true,
            investmentOpportunities: true,
            makeAnnouncement: false,
            editGroupSettings: false,
            manageMembers: false,
        },
    },
    {
        id: 4,
        name: "Tier 4",
        price: 10000,
        visibility: {
            walletBalance: false, // Not visible to all members
            transactions: false, // Withdrawals only visible to Admins
        },
        permissions: {
            withdrawals: false, // Flexible withdrawals
            admins: true, // Three executives have admin rights
            signatories: true,
            loanAccess: true,
            investmentOpportunities: true,
            makeAnnouncement: false,
            editGroupSettings: false,
            manageMembers: false,
        },
    },
];

export default tiers;
