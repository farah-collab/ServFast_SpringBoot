package com.app.servicefinder.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String bio;
    private String city;
    private String profilePhoto;
    private String specialty;
    private Integer experienceYears;
}