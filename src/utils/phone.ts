// helper for reformatting phone numbers for UI display

export const formatPhone = (e164: string): string => {
    // e164: the international standard for formatting telephone numbers 
    // to ensure they are unique worldwide, with a maximum length of 15 digits
    const cleaned = e164.replace(/[^\d]/g, "");
    // if (!e164) return `+1 `;
    // if (cleaned.startsWith("1")) {
        const digits = cleaned.slice(1);
        if (digits.length <= 3) return `${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    // }

    return e164;

}
