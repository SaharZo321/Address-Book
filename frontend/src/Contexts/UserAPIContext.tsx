import { useCookies } from "react-cookie"
import { createContext, PropsWithChildren, useCallback } from "react";
import { MutationFunction, UseMutateAsyncFunction, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeDisplayNameAPI, getConnectedUserAPI, loginAPI, logoutAPI, refreshTokenAPI, registerAPI } from "../api";
import { TokensResponse, User, UserCreateRequest, UserResponse } from "../types";
import axios, { AxiosError, AxiosResponse } from "axios";
import useTokensCookies, { Tokens } from "../hooks/useTokensCookies";
import { useLocation } from "react-router-dom";

type LoginProps = { email: string, password: string }
type CreateUserProps = { email: string, displayName: string, password: string }
type ChangeDisplayNameProps = { displayName: string }

type UserAPIContext = {
    user?: User | null,
    accessToken?: string
    login: UseMutateAsyncFunction<AxiosResponse, AxiosError<any>, LoginProps>,
    logout: UseMutateAsyncFunction<AxiosResponse | void, AxiosError<any>>,
    createUser: UseMutateAsyncFunction<AxiosResponse, AxiosError<any>, CreateUserProps>,
    changeDisplayName: UseMutateAsyncFunction<AxiosResponse | void, AxiosError<any>, ChangeDisplayNameProps>,
}

const emptyAxiosResponse = axios.get("")

export const UserAPIContext = createContext<UserAPIContext>({
    user: null,
    login: () => emptyAxiosResponse,
    logout: () => emptyAxiosResponse,
    createUser: () => emptyAxiosResponse,
    changeDisplayName: () => emptyAxiosResponse,
})

export function UserAPIProvider(props: PropsWithChildren<{ onLogout?: () => void, onLogin?: () => void }>) {
    const queryClient = useQueryClient()

    const { tokens: { accessToken, refreshToken }, setTokens, clearTokens } = useTokensCookies()

    const updateTokens = useCallback(async (refreshToken: string) => {
        const result = await refreshTokenAPI(refreshToken).then(
            response => {
                const tokenResponse: TokensResponse = response.data
                const newTokens: Tokens = {
                    accessToken: tokenResponse.access_token,
                    refreshToken: tokenResponse.refresh_token,
                }
                console.log(newTokens)
                setTokens(newTokens)
                return true
            }, (error) => {
                clearTokens()
                console.error(error)
                return false
            }
        )
        return result
    }, [])

    const { data: currentUser } = useQuery<User | null>({
        queryKey: ["user", accessToken],
        queryFn: async () => {
            console.log("tried again")
            if (!accessToken) {
                if (refreshToken) {
                    console.error("No access token, trying to get refresh token")
                    await updateTokens(refreshToken)
                } else {
                    console.error("No tokens")
                    props.onLogout?.()
                }
                return null
            }
            const newUser = await getConnectedUserAPI(accessToken).then(async response => {
                const { email, display_name: displayName, uuid }: UserResponse = response.data
                const user: User = { email, displayName, uuid }
                console.log(user)
                if (!currentUser) {
                    props.onLogin?.()
                }
                return user
            }, async (error: AxiosError) => {
                if (!error.response) {
                    console.error("server timed out, got no response")
                }
                if (refreshToken) {
                    console.error("access token is invalid, trying to get refresh token")
                    await updateTokens(refreshToken)
                } else {
                    console.error("access token is invalid, no refresh token")
                    props.onLogout?.()
                }
                return null
            })
            return newUser
        },
    })

    const onMutationSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["user"] })
    }, [])

    const onMutationError = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["user"] })
    }, [])

    const { mutateAsync: login } = useMutation<AxiosResponse, AxiosError, LoginProps>({
        mutationFn: loginAPI,
        onSuccess: (response) => {
            const tokensResponse: TokensResponse = response.data
            setTokens({
                accessToken: tokensResponse.access_token,
                refreshToken: tokensResponse.refresh_token
            })
            console.log(tokensResponse)
        }
    })

    const { mutateAsync: logout } = useMutation<AxiosResponse | void, AxiosError>({
        mutationFn: async () => {
            if (accessToken)
                return logoutAPI(accessToken)
        },
        onSuccess: () => {
            clearTokens()
        },
        onError: onMutationError,
    })

    const { mutateAsync: changeDisplayName } = useMutation<AxiosResponse | void, AxiosError, ChangeDisplayNameProps>({
        mutationFn: async ({ displayName }) => {
            if (accessToken)
                return changeDisplayNameAPI({ accessToken, displayName })
        },
        onSuccess: onMutationSuccess,
        onError: onMutationError,
    })

    const { mutateAsync: createUser } = useMutation<AxiosResponse, AxiosError, CreateUserProps>({
        mutationFn: registerAPI,
    })



    return (
        <UserAPIContext.Provider value={{
            user: currentUser,
            accessToken,
            login,
            logout,
            createUser,
            changeDisplayName,
        }}>
            {props.children}
        </UserAPIContext.Provider>
    )
}