package com.app.servicefinder.config;

import com.app.servicefinder.model.Category;
import com.app.servicefinder.model.Enterprise;
import com.app.servicefinder.repository.CategoryRepository;
import com.app.servicefinder.repository.EnterpriseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final EnterpriseRepository enterpriseRepository;

    @Override
    public void run(String... args) {
        initializeCategories();
        initializeEnterprises();
    }

    private void initializeCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding categories...");
            List<Category> categories = Arrays.asList(
                Category.builder().name("IT").description("Dev & Support").icon("💻").color("blue").build(),
                Category.builder().name("Design").description("Creative Arts").icon("🎨").color("purple").build(),
                Category.builder().name("Legal").description("Legal Counsel").icon("⚖️").color("amber").build(),
                Category.builder().name("Health").description("Wellness").icon("❤️").color("red").build(),
                Category.builder().name("Education").description("Tutoring").icon("🎓").color("green").build(),
                Category.builder().name("Home").description("Home Services").icon("🏠").color("teal").build(),
                
                Category.builder().name("Cloud Solutions").description("Cloud Architecture").icon("☁️").color("sky").build(),
                Category.builder().name("Cybersecurity").description("Security & Auditing").icon("🔒").color("indigo").build(),
                Category.builder().name("Data Analytics").description("Big Data & Insights").icon("📊").color("orange").build(),
                Category.builder().name("AI Integration").description("Machine Learning & LLMs").icon("🤖").color("pink").build(),
                Category.builder().name("Software Development").description("Web & Mobile Apps").icon("⚙️").color("emerald").build(),
                
                Category.builder().name("Business Strategy").description("Strategic Planning").icon("📈").color("violet").build(),
                Category.builder().name("Digital Transformation").description("Modernizing Workflows").icon("⚡").color("yellow").build(),
                Category.builder().name("Networking").description("Cabling & Network Setup").icon("🌐").color("cyan").build(),
                Category.builder().name("IT Consulting").description("Consulting Services").icon("👔").color("slate").build(),
                Category.builder().name("Project Management").description("Coordination & Logistics").icon("📅").color("fuchsia").build()
            );
            categoryRepository.saveAll(categories);
            log.info("Successfully seeded categories!");
        }
    }

    private void initializeEnterprises() {
        if (enterpriseRepository.count() == 0) {
            log.info("Seeding enterprises...");
            List<Enterprise> enterprises = Arrays.asList(
                Enterprise.builder()
                    .name("TechCorp Solutions")
                    .description("Innovative global leader in software architecture, cloud orchestration, and enterprise scale development.")
                    .city("Paris")
                    .sector("Tech")
                    .logoUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&q=80")
                    .imageUrl("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80")
                    .websiteUrl("https://techcorp.example.com")
                    .employeeCount(450)
                    .build(),
                Enterprise.builder()
                    .name("Alpha Strategy Consulting")
                    .description("High-impact strategic guidance, business scaling, organizational change management, and leadership consultancy.")
                    .city("Lyon")
                    .sector("Consulting")
                    .logoUrl("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=80&q=80")
                    .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80")
                    .websiteUrl("https://alphastrategy.example.com")
                    .employeeCount(120)
                    .build(),
                Enterprise.builder()
                    .name("Nova Digital Media")
                    .description("Premier digital transforming media agency specializing in video branding, interactive design, and product marketing.")
                    .city("Marseille")
                    .sector("Design")
                    .logoUrl("https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=80&q=80")
                    .imageUrl("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80")
                    .websiteUrl("https://novadigital.example.com")
                    .employeeCount(75)
                    .build(),
                Enterprise.builder()
                    .name("Quantum FinTech")
                    .description("Next generation banking security protocols, blockchain integration, and predictive automated wealth analytics.")
                    .city("Paris")
                    .sector("Finance")
                    .logoUrl("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&q=80")
                    .imageUrl("https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80")
                    .websiteUrl("https://quantumfintech.example.com")
                    .employeeCount(220)
                    .build()
            );
            enterpriseRepository.saveAll(enterprises);
            log.info("Successfully seeded enterprises!");
        }
    }
}
