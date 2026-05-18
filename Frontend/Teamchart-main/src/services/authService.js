import api from "../components/utility/BaseAPI";

export const loginUser = async (formData) => {
    // This function takes your username/password object and sends it to Spring Boot
    const response = await api.post("/auth/login", formData);
    return response;
};
