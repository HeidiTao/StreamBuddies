import { usePhoneFormatter } from "../usePhoneFormatter";
import { renderHook, act } from '@testing-library/react-native';
import * as phoneUtils from '../../utils/phone';

describe("usePhoneFormatter", () => {
    it("starts with empty state", () => {
        const { result } = renderHook(() => usePhoneFormatter());

        expect(result.current.rawNumber).toBe("");
        expect(result.current.formattedNumber).toBe("");
    });

    it("updates raw and formatted numbers when input is valid", () => {
        jest.spyOn(phoneUtils, "formatPhone").mockReturnValue("(123) 456-7890");

        const { result } = renderHook(() => usePhoneFormatter());

        act(() => {
            result.current.setPhoneFromInput("+11234567890");
        });

        expect(result.current.rawNumber).toBe("+11234567890");
        expect(result.current.formattedNumber).toBe("(123) 456-7890");
    });

    it("does NOT update when input exceeds 12 characters", () => {
        const { result } = renderHook(() => usePhoneFormatter());

        act(() => {
            result.current.setPhoneFromInput("123456789012345"); // too long
        });

        expect(result.current.rawNumber).toBe("");        // unchanged
        expect(result.current.formattedNumber).toBe("");   // unchanged
    });
});