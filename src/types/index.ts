// Project types
export interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    link?: string;
    github?: string;
}

// Video types
export interface Video {
    id: string;
    title: string;
    videoId: string;
    description: string;
}

// Contact form types
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export interface ContactFormStatus {
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
}
