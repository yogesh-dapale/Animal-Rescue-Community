package com.arc.service;

import com.arc.dto.ContactDTO;
import java.util.List;

public interface ContactService {

    ContactDTO saveContact(ContactDTO contactDTO);

    List<ContactDTO> getAllContacts();

    ContactDTO getContactById(Long id);

    
}
