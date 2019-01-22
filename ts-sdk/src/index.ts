import {default as fetch} from 'cross-fetch'

type Context = {
	[key: string]: any,
}
type Ididentity = {id : string} & Context

type ConfigzioParameters = {
	application: string, 
	getToken?: () => Promise<string> | null,
}

export default function Configzio({application, getToken,}: ConfigzioParameters) {
	if (!application) {
		throw new Error("must provide application")
	}
	if (!application.match(/^[a-z0-9\-]+$/i)) {
		throw new Error("Application must a string containing only letters and numbers")
	}

	const getFullUrl = (resource: string) => `https://${application}.api.configz.io/api/v2/${resource}`
	const _getToken = getToken || (() => null)
	const getAuthorizationHeader = (token: string | null): {Authorization: string} | {} => token ? { Authorization: `Bearer ${token}` } : {}

	async function getValue<T>(fullKeyPath: string, identities?: Ididentity[] | Ididentity): Promise<T> {
		const response = await fetch(getFullUrl(`values/${fullKeyPath}`),
			{
				method: 'GET',
				headers: {
					...getAuthorizationHeader(await _getToken()),
				},				
			},
		)

		if (response.status > 299) {
			throw new Error(`Configzio return Http code: ${response.status}`)
		}

		const value: T = await response.json()

		return value
	}

	async function getContext(identityType: string, identityId: string): Promise<Context> {
		const response = await fetch(getFullUrl(`context/${identityType}/${identityId}`),
			{
				method: 'GET',
				headers: {
					...getAuthorizationHeader(await _getToken()),
				},
			},
		)

		if (response.status > 299) {
			throw new Error(`Configzio return Http code: ${response.status}`)
		}

		const value: {[key: string]: any} = await response.json()

		return value
	}

	async function setContext(identityType: string, identityId: string, context: {[key: string]: any}): Promise<void>  {
		const response = await fetch(getFullUrl(`context/${identityType}/${identityId}`),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthorizationHeader(await _getToken()),
				},
				body: JSON.stringify(context),
			},
		)
		
		if (response.status > 299) {
			throw new Error(`Configzio return Http code: ${response.status}`)
		}
	}

	async function deleteContext(identityType: string, identityId: string, property: string): Promise<void>  {
		const response = await fetch(getFullUrl(`context/${identityType}/${identityId}/${property}`),
			{
				method: 'DELETE',
				headers: {
					...getAuthorizationHeader(await _getToken()),
				},
			},
		)
		
		if (response.status > 299) {
			throw new Error(`Configzio return Http code: ${response.status}`)
		}
	}
	
	return {
		getValue,
		getContext,
		setContext,
		deleteContext,
	}
}