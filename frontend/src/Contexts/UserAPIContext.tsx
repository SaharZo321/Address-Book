import { useCookies } from "react-cookie"
import { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { MutationFunction, UseMutateAsyncFunction, useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeDisplayNameAPI, changePasswordAPI, deactivateUserAPI, getConnectedUserAPI, loginAPI, logoutAPI, refreshTokenAPI, registerAPI, verifyPasswordAPI } from "../api";
import { TokensResponse, User, UserCreateRequest, UserResponse } from "../types";
import axios, { AxiosError, AxiosResponse } from "axios";
import useTokensCookies, { Tokens } from "../hooks/useTokensCookies";
import { useLocation } from "react-router-dom";

type LoginProps = { email: string, password: string }
type CreateUserProps = { email: string, displayName: string, password: string }
type ChangeDisplayNameProps = { displayName: string }
type PasswordProps = { password: string }

export type UserAPIContext = {
    user?: User | null,
    accessToken?: string
    login: UseMutationResult<AxiosResponse, AxiosError<any>, LoginProps>,
    logout: UseMutationResult<AxiosResponse, AxiosError<any>, void>,
    createUser: UseMutationResult<AxiosResponse, AxiosError<any>, CreateUserProps>,
    changeDisplayName: UseMutationResult<AxiosResponse, AxiosError<any>, ChangeDisplayNameProps>,
    verifyPassword: UseMutationResult<AxiosResponse, AxiosError<any>, PasswordProps>,
    changePassword: UseMutationResult<AxiosResponse, AxiosError<any>, PasswordProps>,
    deactivateUser: UseMutationResult<AxiosResponse, AxiosError<any>, void>,
}

const UserAPIContext = createContext<UserAPIContext | undefined>(undefined)

export const useUserAPIContext = () => {
    const context = useContext(UserAPIContext)
    if (!context) {
        throw new Error("useContactAPIContext must be used within a ContactAPIProvider")
    }
    return context
}

export function UserAPIProvider(props: PropsWithChildren<{ onLogout?: () => void, onLogin?: () => void }>) {
    const queryClient = useQueryClient()

    const { tokens, setTokens, clearTokens } = useTokensCookies()

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
        queryKey: ["user", tokens?.accessToken],
        queryFn: async () => {
            if (!tokens?.accessToken) {
                if (tokens?.refreshToken) {
                    console.error("No access token, trying to get refresh token")
                    await updateTokens(tokens.refreshToken)
                } else {
                    console.error("No tokens")
                    props.onLogout?.()
                }
                return null
            }
            const newUser = await getConnectedUserAPI(tokens.accessToken).then(async response => {
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
                if (tokens?.refreshToken) {
                    console.error("access token is invalid, trying to get refresh token")
                    await updateTokens(tokens.refreshToken)
                } else {
                    console.error("access token is invalid, no refresh token")
                    props.onLogout?.()
                }
                return null
            })
            return newUser
        },
    })

    const invalidateUser = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["user"] })
    }, [])

    const loginMutaion = useMutation<AxiosResponse, AxiosError, LoginProps>({
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

    const logoutMutation = useMutation<AxiosResponse, AxiosError, void>({
        mutationFn: async () => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return logoutAPI(tokens.accessToken)
        },
        onSuccess: () => {
            clearTokens()
        },
        onError: invalidateUser,
    })

    const changeDisplayNameMutation = useMutation<AxiosResponse, AxiosError, ChangeDisplayNameProps>({
        mutationFn: async ({ displayName }) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return changeDisplayNameAPI({ accessToken: tokens.accessToken, displayName })
        },
        onSuccess: invalidateUser,
        onError: invalidateUser,
    })

    const createUserMutation = useMutation<AxiosResponse, AxiosError, CreateUserProps>({
        mutationFn: registerAPI,
    })

    const verifyPasswordMutation = useMutation<AxiosResponse, AxiosError, PasswordProps>({
        mutationFn: async ({ password }) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return verifyPasswordAPI({ accessToken: tokens.accessToken, password })
        },
        onSuccess: response => {
            setTokens({
                securityToken: response.data.security_token
            })
        },
        onError: error => {
            if (error.response?.status === 403) {
                invalidateUser()
            }
        }
    })

    const changePasswordMutation = useMutation<AxiosResponse, AxiosError, PasswordProps>({
        mutationFn: async ({ password }) => {
            if (!tokens?.securityToken) {
                throw new Error("No security token")
            }
            return changePasswordAPI({ securityToken: tokens.securityToken, password })
        },
        onSuccess: invalidateUser
    })

    const deactivateUserMutation = useMutation<AxiosResponse, AxiosError, void>({
        mutationFn: async () => {
            if (!tokens?.securityToken) {
                throw new Error("No security token")
            }
            return deactivateUserAPI({ securityToken: tokens.securityToken })
        },
        onError: invalidateUser,
        onSuccess: invalidateUser
    })


    return (
        <UserAPIContext.Provider value={{
            user: currentUser,
            accessToken: tokens?.accessToken,
            login: loginMutaion,
            logout: logoutMutation,
            createUser: createUserMutation,
            changeDisplayName: changeDisplayNameMutation,
            verifyPassword: verifyPasswordMutation,
            changePassword: changePasswordMutation,
            deactivateUser: deactivateUserMutation,
        }}>
            {props.children}
        </UserAPIContext.Provider>
    )
}