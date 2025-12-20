export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'textarea' | 'select';

export type FieldDefinition = {
    id: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    description?: string;
    options?: string[]; // For select
};

export type SectionDefinition = {
    id: string;
    title: string;
    category: 'personal' | 'business';
    description?: string;
    gatingQuestion?: {
        id: string; // This key will store the boolean answer
        text: string;
    };
    fields: FieldDefinition[];
};

export const INTAKE_SECTIONS: SectionDefinition[] = [
    {
        id: 'tax_situation',
        title: 'Tax Situation',
        category: 'personal',
        description: 'First, let us determine what type of tax return we are preparing.',
        fields: [
            {
                id: 'taxType',
                label: 'What describes your tax situation for this year?',
                type: 'select',
                options: ['Personal Only', 'Personal + Business (Self-Employed/Freelance)'],
                required: true
            },
            {
                id: 'filingStatus',
                label: 'Filing Status',
                type: 'select',
                options: ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household', 'Qualifying Widow(er)'],
                required: true
            },
            {
                id: 'maritalChange',
                label: 'Were there any changes in marital status during the year?',
                type: 'select',
                options: ['No Changes', 'Married', 'Divorced', 'Widowed', 'Separated']
            }
        ]
    },
    {
        id: 'profile',
        title: 'Personal Profile',
        category: 'personal',
        description: 'Basic contact and personal information.',
        fields: [
            { id: 'firstName', label: 'First Name', type: 'text', required: true },
            { id: 'lastName', label: 'Last Name', type: 'text', required: true },
            { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
            { id: 'phone', label: 'Phone Number', type: 'text', required: true },
            { id: 'address', label: 'Street Address', type: 'text', required: true },
            { id: 'state', label: 'State', type: 'select', options: ['AZ', 'CA', 'NV', 'UT', 'NM', 'Other'], required: true },
            { id: 'zip', label: 'Zip Code', type: 'text', required: true },
            { id: 'occupation', label: 'Occupation', type: 'text', required: true },
            { id: 'identityPIN', label: 'IRS Identity Protection PIN (If applicable)', type: 'text' },
        ]
    },
    {
        id: 'dependents',
        title: 'Dependents',
        category: 'personal',
        gatingQuestion: {
            id: 'hasDependents',
            text: 'Do you have any dependents to claim (Children, parents, etc)?'
        },
        fields: [
            { id: 'dependentNames', label: 'Dependent Names & SSNs', type: 'textarea', placeholder: 'Name 1 - SSN - DOB - Relationship\nName 2 - SSN - DOB - Relationship' },
            { id: 'childcareExpenses', label: 'Did you pay any childcare expenses for these dependents?', type: 'select', options: ['No', 'Yes'] }
        ]
    },
    {
        id: 'income',
        title: 'Personal Income',
        category: 'personal',
        gatingQuestion: {
            id: 'hasIncomeDocs',
            text: 'Did you receive any official income documents (W-2, 1099, etc)?'
        },
        fields: [
            { id: 'w2Count', label: 'How many W-2 forms do you have?', type: 'number' },
            { id: 'interestIncome', label: 'Interest/Dividend Income (1099-INT/DIV)', type: 'currency' },
            { id: 'retirementIncome', label: 'Retirement Distributions (1099-R)', type: 'currency' },
            { id: 'stockSales', label: 'Stock Sales Proceeds (1099-B)', type: 'currency' },
            { id: 'cryptoActive', label: 'Did you sell, exchange, or receive any digital assets/crypto?', type: 'select', options: ['No', 'Yes'] },
            { id: 'unemploymentIncome', label: 'Unemployment Compensation (1099-G)', type: 'currency' },
            { id: 'gamblingWinnings', label: 'Gambling Winnings (W-2G)', type: 'currency' },
            { id: 'alimonyReceived', label: 'Alimony Received', type: 'currency' },
            { id: 'rentalIncome', label: 'Rental Real Estate & Royalties (Schedule E)', type: 'currency' },
            { id: 'k1Income', label: 'Income from Partnerships/S-Corps/Trusts (Schedule K-1)', type: 'currency' },
            { id: 'socialSecurity', label: 'Social Security Benefits (SSA-1099)', type: 'currency' },
            { id: 'juryDuty', label: 'Jury Duty Pay', type: 'currency' }
        ]
    },
    {
        id: 'schedule_c_income',
        title: 'Business Income (Schedule C)',
        category: 'business',
        gatingQuestion: {
            id: 'hasSelfEmployment',
            text: 'Did you have any self-employment or business income?'
        },
        fields: [
            { id: 'businessName', label: 'Business Name', type: 'text' },
            { id: 'businessType', label: 'Business Activity/Description', type: 'text' },
            { id: 'grossReceipts', label: 'Gross Receipts/Sales', type: 'currency' },
            { id: 'otherIncome', label: 'Other Business Income', type: 'currency' },
        ]
    },
    {
        id: 'business_expenses',
        title: 'Business Expenses',
        category: 'business',
        gatingQuestion: {
            id: 'hasBusinessExpenses',
            text: 'Do you have business expenses to deduct?'
        },
        fields: [
            { id: 'advertising', label: 'Advertising & Marketing', type: 'currency' },
            { id: 'insurance', label: 'Business Insurance', type: 'currency' },
            { id: 'legalProf', label: 'Legal & Professional Fees', type: 'currency' },
            { id: 'officeExpense', label: 'Office Expenses (Supplies, Software)', type: 'currency' },
            { id: 'rentLease', label: 'Rent or Lease (Vehicles/Machinery/Building)', type: 'currency' },
            { id: 'repairsMain', label: 'Repairs & Maintenance', type: 'currency' },
            { id: 'taxesLicenses', label: 'Taxes & Licenses', type: 'currency' },
            { id: 'travel', label: 'Travel Expenses', type: 'currency' },
            { id: 'meals', label: 'Deductible Meals (50%)', type: 'currency' },
            { id: 'utilities', label: 'Utilities (Business Only)', type: 'currency' },
            { id: 'wages', label: 'Wages Paid to Employees', type: 'currency' },
            { id: 'contractLabor', label: 'Contract Labor', type: 'currency' },
            { id: 'otherExp', label: 'Other Expenses (List in notes)', type: 'currency' },
        ]
    },
    {
        id: 'rental_expenses',
        title: 'Rental Property Expenses (Schedule E)',
        category: 'personal', // Technically personal return but needs specific trigger
        gatingQuestion: {
            id: 'hasRentalExpenses',
            text: 'Do you have expenses for your rental property?'
        },
        fields: [
            { id: 'rentalAddress', label: 'Property Address', type: 'text' },
            { id: 'rentalAdvertising', label: 'Advertising', type: 'currency' },
            { id: 'rentalCleaning', label: 'Cleaning & Maintenance', type: 'currency' },
            { id: 'rentalInsurance', label: 'Insurance', type: 'currency' },
            { id: 'rentalRepairs', label: 'Repairs', type: 'currency' },
            { id: 'rentalTaxes', label: 'Real Estate Taxes', type: 'currency' },
            { id: 'rentalMortgageInterest', label: 'Mortgage Interest', type: 'currency' },
            { id: 'rentalDepreciation', label: 'Depreciation Expense (if known)', type: 'currency' }
        ]
    },
    {
        id: 'vehicle',
        title: 'Vehicle Information',
        category: 'business',
        gatingQuestion: {
            id: 'hasVehicle',
            text: 'Did you use a personal vehicle for business?'
        },
        fields: [
            { id: 'vehicleDescription', label: 'Vehicle Make/Model/Year', type: 'text' },
            { id: 'datePlacedInService', label: 'Date Placed in Service', type: 'date' },
            { id: 'totalMiles', label: 'Total Miles Driven', type: 'number' },
            { id: 'businessMiles', label: 'Business Miles', type: 'number' },
            { id: 'commutingMiles', label: 'Commuting Miles', type: 'number' },
            { id: 'parkingTolls', label: 'Parking Fees & Tolls', type: 'currency' },
        ]
    },
    {
        id: 'home_office',
        title: 'Home Office Deduction',
        category: 'business',
        gatingQuestion: {
            id: 'hasHomeOffice',
            text: 'Did you use a dedicated area of your home exclusively for business?'
        },
        fields: [
            { id: 'homeSqFt', label: 'Total Home Sq Ft', type: 'number' },
            { id: 'officeSqFt', label: 'Office Area Sq Ft', type: 'number' },
            { id: 'hoMortgageInterest', label: 'Mortgage Interest', type: 'currency' },
            { id: 'hoRealEstateTaxes', label: 'Real Estate Taxes', type: 'currency' },
            { id: 'hoInsurance', label: 'Homeowners Insurance', type: 'currency' },
            { id: 'hoRepairs', label: 'Repairs & Maintenance', type: 'currency' },
            { id: 'hoUtilities', label: 'Utilities', type: 'currency' },
            { id: 'hoOther', label: 'Other Home Expenses (HOA etc)', type: 'currency' },
        ]
    },
    {
        id: 'schedule_a_itemized',
        title: 'Itemized Deductions (Schedule A)',
        category: 'personal',
        gatingQuestion: {
            id: 'hasItemized',
            text: 'Do you want to report itemized deductions (Medical, Charity, Mortgage Interest)?'
        },
        fields: [
            { id: 'medicalInsurance', label: 'Medical/Dental Insurance Premiums (Post-Tax)', type: 'currency' },
            { id: 'doctorsDentists', label: 'Doctors, Dentists, Hospitals', type: 'currency' },
            { id: 'mortgageInterest1098', label: 'Home Mortgage Interest (Form 1098)', type: 'currency' },
            { id: 'realEstateTax', label: 'Real Estate Taxes (Primary Home)', type: 'currency' },
            { id: 'charityCash', label: 'Charitable Gifts by Cash/Check', type: 'currency' },
            { id: 'charityGoods', label: 'Charitable Gifts by Goods (Fair Market Value)', type: 'currency' },
            { id: 'studentLoanInterest', label: 'Student Loan Interest', type: 'currency' },
            { id: 'hsaContrib', label: 'HSA Contributions (Not through employer)', type: 'currency' },
            { id: 'iraContrib', label: 'Traditional IRA Contributions', type: 'currency' },
            { id: 'educatorExpenses', label: 'Educator Expenses (Teachers)', type: 'currency' },
            { id: 'tuition', label: 'Tuition & Fees (1098-T)', type: 'currency' },
            { id: 'energyCredits', label: 'Residential Energy Credits (Solar/Wind)', type: 'currency' },
            { id: 'evCredit', label: 'Electric Vehicle Credit', type: 'currency' }
        ]
    },
    {
        id: 'other_info',
        title: 'Other Information',
        category: 'personal',
        fields: [
            { id: 'directDepositAccount', label: 'Bank Name for Direct Deposit', type: 'text' },
            { id: 'routingNumber', label: 'Bank Routing Number', type: 'text' },
            { id: 'accountNumber', label: 'Bank Account Number', type: 'text' },
            { id: 'accountType', label: 'Account Type', type: 'select', options: ['Checking', 'Savings'] },
            { id: 'notes', label: 'Anything else your tax preparer should know?', type: 'textarea' }
        ]
    }
];

// Helper to determine active steps based on answers
export function getActiveSections(data: Record<string, any>) {
    return INTAKE_SECTIONS.filter(section => {
        // 1. Check if we should skip business sections
        if (section.category === 'business') {
            const isBusinessUser = data.taxType === 'Personal + Business (Self-Employed/Freelance)';
            if (!isBusinessUser) return false;
        }

        // 2. Special case for Rental Expenses
        if (section.id === 'rental_expenses') {
            // Only show if user indicated Rental Income in the Income section
            // We check if the field has a value (assuming 'currency' stores a string or number)
            const hasRentalIncome = data.rentalIncome && data.rentalIncome != '0' && data.rentalIncome != '';
            if (!hasRentalIncome) return false;
        }

        // 2. Check gating question if present
        // Note: For now we always show sections that have gating questions 
        // because the question itself is INSIDE the section UI.
        // We only filter out the entire block if the user chose "Personal Only" above.

        return true;
    });
}
