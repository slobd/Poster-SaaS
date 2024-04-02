import { Plugin } from '@nuxt/types'
import { AxiosInstance } from 'axios'
import { BoardsApi, Configuration, TasksApi, WorkspacesApi } from '@/sdk'

export interface DefaultApi {
    boards: BoardsApi
    tasks: TasksApi
    workspace: WorkspacesApi
}

const apiPlugin: Plugin = ({ $axios }, inject) => {
    const config: [Configuration | undefined, string, AxiosInstance] = [
        undefined,
        $axios.defaults.baseURL as string,
        $axios,
    ]
    // const api = new DefaultApi(undefined, $axios.defaults.baseURL, $axios)

    const api = {
        boards: new BoardsApi(...config),
        tasks: new TasksApi(...config),
        workspaces: new WorkspacesApi(...config),
    }

    inject('api', api)
}

export default apiPlugin
