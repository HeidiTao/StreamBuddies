import { useState } from "react";
import { formatPhone } from "../utils/phone";

export const usePhoneFormatter = () => {
    const [rawNumber, setRawNumber] = useState("");
    const [formattedNumber, setFormattedNumber] = useState("");

    const setPhoneFromInput = (input: string) => {
        const cleaned = input.replace(/[^\d+]/g, "");
        if (cleaned.length <= 12) {
            setRawNumber(cleaned);
            setFormattedNumber(formatPhone(cleaned));
            console.log("raw number: ", cleaned, " | formatted", formatPhone(cleaned));
        }
    }

    return {
        rawNumber,
        formattedNumber,
        setPhoneFromInput
    }
}