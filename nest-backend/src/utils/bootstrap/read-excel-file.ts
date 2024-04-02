import xlsx from 'node-xlsx'
import { PosterVisibilityEnum } from '@prisma/client'

export function fetchDemoPeopleProjectData(): {
    people: any[]
    project: any[]
    gallery: any[]
} {
    const workSheetsFromFile = xlsx.parse(
        process.cwd() + '/assets/demo-tenant.xlsx',
    )

    const people = workSheetsFromFile[0].data
    const project = workSheetsFromFile[1].data
    const gallery = workSheetsFromFile[2].data

    const peopleData = getPeopleData(people)
    const projectData = getProjectData(project)
    const galleryData = getGalleryData(gallery, peopleData)

    return {
        people: peopleData,
        project: projectData,
        gallery: galleryData,
    }

    function getPeopleData(people) {
        const peopleData = []
        people.forEach(function (user, index) {
            if (index === 0) return

            peopleData.push({
                firstName: user[0].split(' ')[0],
                lastName: user[0].split(' ')[1],
                email: user[3],
                currentPosition: user[1],
                organization: user[2],
            })
        })
        return peopleData
    }

    function getProjectData(projects) {
        const projectData = []
        projects.forEach(function (project, index) {
            if (index === 0) return
            if (project[0] === undefined) return
            projectData.push({
                name: project[0],
                summary: project[1],
                topics: [project[2]],
                keywords: [project[3], project[4], project[5]],
            })
        })
        return projectData
    }

    function getGalleryData(posters: any[], peopleData: any[]) {
        const galleryData = []
        posters.forEach(function (poster, index) {
            if (index === 0) return
            if (poster[0] === undefined) return

            const authorDisplayName = poster[2] as string

            const author = checkUser(peopleData, authorDisplayName)

            const coAuthors = checkCoAuthors(poster, peopleData)

            coAuthors.unshift(author)

            if (author)
                galleryData.push({
                    title: poster[0],
                    description: poster[1],
                    authors: coAuthors.filter((u) => u !== undefined),
                    user: author,
                    keywords: checkKeywords(poster),
                    topics: checkTopics(poster),
                    visibility: PosterVisibilityEnum.PUBLIC,
                })
        })
        return galleryData
    }

    function checkUser(users: any[], displayName: string) {
        const user = users.filter(
            (u) => `${u.firstName} ${u.lastName}` === displayName,
        )
        if (user.length > 0 && user[0].email !== undefined)
            return { email: user[0].email }
    }

    function checkCoAuthors(poster, users) {
        const coAuthorList = []
        if (poster[3] !== undefined) {
            coAuthorList.push(checkUser(users, poster[3]))
        }
        if (poster[4] !== undefined) {
            coAuthorList.push(checkUser(users, poster[4]))
        }
        if (poster[5] !== undefined) {
            coAuthorList.push(checkUser(users, poster[5]))
        }
        return coAuthorList
    }

    function checkTopics(poster) {
        const topicList = []
        if (poster[6] !== undefined) topicList.push({ name: poster[6] })
        if (poster[7] !== undefined) topicList.push({ name: poster[7] })
        return topicList
    }

    function checkKeywords(poster) {
        const keywordList = []
        if (poster[8] !== undefined) keywordList.push({ name: poster[8] })
        if (poster[9] !== undefined) keywordList.push({ name: poster[9] })
        if (poster[10] !== undefined) keywordList.push({ name: poster[10] })
        return keywordList
    }
}
