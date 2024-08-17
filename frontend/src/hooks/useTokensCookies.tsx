import { useCallback } from "react"
import { useCookies } from "react-cookie"
import { refreshTokenAPI } from "../api"
import { TokensResponse } from "../types"

export type Tokens = {
    accessToken?: string,
    refreshToken?: string
}

export default function useTokensCookies(): { tokens: Tokens, clearTokens: () => void, setTokens: (tokens: Tokens) => void } {
    const [tokensCookies, setTokensCookies, removeTokensCookies] = useCookies(["access-token", "refresh-token"])

    const setTokens = useCallback((tokens: Tokens) => {
        const { accessToken, refreshToken } = tokens
        if (accessToken) {
            setTokensCookies("access-token", accessToken)
        }
        if (refreshToken) {
            setTokensCookies("refresh-token", refreshToken)
        }
    }, [])

    const clearTokens = useCallback(() => {
        removeTokensCookies("access-token")
        removeTokensCookies("refresh-token")
    }, [])


    return {
        tokens: {
            accessToken: tokensCookies["access-token"],
            refreshToken: tokensCookies["refresh-token"]
        },
        clearTokens,
        setTokens,
    }
}