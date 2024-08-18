import { useCallback } from "react"
import { useCookies } from "react-cookie"

export type Tokens = {
    accessToken?: string,
    refreshToken?: string,
    securityToken?: string,
} | undefined

export default function useTokensCookies(): { tokens: Tokens, clearTokens: () => void, setTokens: (tokens: Tokens) => void } {
    const [tokensCookies, setTokensCookies, removeTokensCookies] = useCookies(["tokens"])

    const setTokens = useCallback((tokens: Tokens) => {
        const oldTokens: Tokens = tokensCookies.tokens
        const newTokens: Tokens = {
            ...oldTokens,
            ...tokens
        }
        setTokensCookies("tokens", newTokens)
    }, [tokensCookies])

    const clearTokens = useCallback(() => {
        removeTokensCookies("tokens")
    }, [])


    return {
        tokens: tokensCookies.tokens,
        clearTokens,
        setTokens,
    }
}