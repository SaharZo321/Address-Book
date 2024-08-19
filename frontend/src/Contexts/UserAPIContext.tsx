import { useCookies } from "react-cookie"
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react";
import { MutationFunction, UseMutateAsyncFunction, useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { activateUserAPI, changeDisplayNameAPI, changePasswordAPI, deactivateUserAPI, getConnectedUserAPI, loginAPI, logoutAPI, refreshTokenAPI, registerAPI, verifyPasswordAPI } from "../api";
import { TokensResponse, User, UserCreateRequest, UserResponse } from "../types";
import axios, { AxiosError, AxiosResponse } from "axios";
import useTokensCookies, { Tokens } from "../hooks/useTokensCookies";
import { useLocation } from "react-router-dom";
import { SnackBarContext } from "../App";

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
    deactivateUser: UseMutationResult<AxiosResponse, AxiosError<any>, {}>,
    activateUser: UseMutationResult<AxiosResponse, AxiosError<any>, LoginProps>
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
    const { openSnackbar, openErrorSnackbar } = useContext(SnackBarContext)
    const { tokens, setTokens, clearTokens } = useTokensCookies()

    const { mutateAsync: updateTokens } = useMutation<AxiosResponse, AxiosError, { refreshToken: string }>({
        mutationFn: ({ refreshToken }) => refreshTokenAPI(refreshToken),
        onSuccess: response => {
            const tokenResponse: TokensResponse = response.data
            const newTokens: Tokens = {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            }
            console.log(newTokens)
            setTokens(newTokens)
        },
        onError: (error) => {
            clearTokens()
            console.error(error)
        },
    })

    const { data: currentUser } = useQuery<User | null>({
        queryKey: ["user", tokens?.accessToken],
        queryFn: async () => {
            if (!tokens?.accessToken) {
                if (tokens?.refreshToken) {
                    console.error("No access token, trying to get refresh token")
                    await updateTokens({ refreshToken: tokens.refreshToken })
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
                    openErrorSnackbar()
                }
                if (tokens?.refreshToken) {
                    console.error("access token is invalid, trying to get refresh token")
                    await updateTokens({ refreshToken: tokens.refreshToken })
                } else {
                    console.error("access token is invalid, no refresh token")
                    openErrorSnackbar()
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
        onSuccess: response => {
            const tokensResponse: TokensResponse = response.data
            setTokens({
                accessToken: tokensResponse.access_token,
                refreshToken: tokensResponse.refresh_token
            })
            console.log(tokensResponse)
            openSnackbar({
                open: true,
                severity: "success",
                message: "Logged in successfully"
            })
        },
        onError: openErrorSnackbar
    })

    const activateUserMutaion = useMutation<AxiosResponse, AxiosError, LoginProps>({
        mutationFn: activateUserAPI,
        onSuccess: () => {
            openSnackbar({
                open: true,
                severity: "success",
                message: "User activated in successfully"
            })
        },
        onError: openErrorSnackbar
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
            openSnackbar({
                open: true,
                severity: "info",
                message: "Logged out successfully"
            })
        },
        onError: () => {
            openErrorSnackbar()
            invalidateUser()
        },
    })

    const changeDisplayNameMutation = useMutation<AxiosResponse, AxiosError, ChangeDisplayNameProps>({
        mutationFn: async ({ displayName }) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return changeDisplayNameAPI({ accessToken: tokens.accessToken, displayName })
        },
        onSuccess: (_, { displayName }) => {
            openSnackbar({
                open: true,
                severity: "success",
                message: `Display name was changed to ${displayName} successfully`,
            })
            invalidateUser()
        },
        onError: () => {
            openErrorSnackbar()
            invalidateUser()
        },
    })

    const createUserMutation = useMutation<AxiosResponse, AxiosError, CreateUserProps>({
        mutationFn: registerAPI,
        onSuccess: () => {
            openSnackbar({
                open: true,
                severity: "success",
                message: `User was created successfully`,
            })
            invalidateUser()
        },
        onError: () => {
            openErrorSnackbar()
        },
    })

    const verifyPasswordMutation = useMutation<AxiosResponse, AxiosError, PasswordProps>({
        mutationFn: async ({ password }) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return verifyPasswordAPI({ accessToken: tokens.accessToken, password })
        },
        onSuccess: response => {
            const securityToken = response.data.security_token
            console.log(securityToken)
            setTokens({
                securityToken,
            })
        },
        onError: error => {
            openErrorSnackbar()
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
        onSuccess: () => {
            openSnackbar({
                open: true,
                severity: "success",
                message: `Password was changed successfully`,
            })
            invalidateUser()
        },
        onError: error => {
            openErrorSnackbar()
            if (error.response?.status === 403) {
                invalidateUser()
            }
        }
    })

    const deactivateUserMutation = useMutation<AxiosResponse, AxiosError, {}>({
        mutationFn: async () => {
            if (!tokens?.securityToken) {
                throw new Error("No security token")
            }
            console.log(tokens.securityToken)
            return deactivateUserAPI({ securityToken: tokens.securityToken })
        },
        onSuccess: () => {
            openSnackbar({
                open: true,
                severity: "error",
                message: `User was deactivated successfully`,
            })
            invalidateUser()
        },
        onError: () => {
            openErrorSnackbar()
            invalidateUser()
        },
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
            activateUser: activateUserMutaion,
        }}>
            {props.children}
        </UserAPIContext.Provider>
    )
}