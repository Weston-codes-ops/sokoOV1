package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, UUID> {
    Optional<CustomerOrder> findByIdAndCustomer_Id(UUID id, UUID customerId);
}
