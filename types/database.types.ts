export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    updated_at?: string | null
                }
            }
            clients: {
                Row: {
                    id: string
                    created_at: string
                    firm_admin_id: string
                    email: string
                    name: string
                    status: 'active' | 'archived'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    firm_admin_id: string
                    email: string
                    name: string
                    status?: 'active' | 'archived'
                }
                Update: {
                    id?: string
                    created_at?: string
                    firm_admin_id?: string
                    email?: string
                    name?: string
                    status?: 'active' | 'archived'
                }
            }
            intakes: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    client_id: string
                    tax_year: number
                    status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed'
                    token: string
                    data: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    client_id: string
                    tax_year: number
                    status?: 'not_started' | 'in_progress' | 'submitted' | 'reviewed'
                    token?: string
                    data?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    client_id?: string
                    tax_year?: number
                    status?: 'not_started' | 'in_progress' | 'submitted' | 'reviewed'
                    token?: string
                    data?: Json
                }
            }
        }
    }
}
