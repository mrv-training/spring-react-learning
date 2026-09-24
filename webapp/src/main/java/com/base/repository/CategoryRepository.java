package com.base.repository;

import com.base.entity.CategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

	@Query("""
			select c from CategoryEntity c
			where :q is null or :q = ''
			or lower(c.name) like lower(concat('%', :q, '%'))
			or lower(coalesce(c.description, '')) like lower(concat('%', :q, '%'))
			""")
	Page<CategoryEntity> search(@Param("q") String q, Pageable pageable);
}
