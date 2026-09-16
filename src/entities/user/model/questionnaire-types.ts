export type RelationshipGoal = 'serious' | 'casual' | 'friendship' | 'open' | 'unsure'

export interface UserQuestionnaire {
    relationshipGoal: RelationshipGoal | null
    interests: string[]
    lifestyle: string[]
    dealbreakers: string[]
    idealPartner: string | null
    updatedAt: string | null
}

export interface UpdateQuestionnaireRequest {
    relationshipGoal: RelationshipGoal | null
    interests: string[]
    lifestyle: string[]
    dealbreakers: string[]
    idealPartner: string | null
}

export interface QuestionnaireResponse {
    questionnaire: UserQuestionnaire
}
