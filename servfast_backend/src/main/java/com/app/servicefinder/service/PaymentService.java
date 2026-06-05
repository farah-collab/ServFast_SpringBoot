package com.app.servicefinder.service;
 
import com.app.servicefinder.dto.payment.*;
import com.app.servicefinder.repository.*;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
 
@Service
@RequiredArgsConstructor
public class PaymentService {
 
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;
 
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
 
public PaymentResponseDTO createPaymentIntent(Long userId, PaymentRequest request) {
        Stripe.apiKey = stripeSecretKey;
        serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));
 
        try {
            // Convertir en centimes (Stripe utilise les centimes)
            long amountInCents = (long) (request.getAmount() * 100);
 
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.getCurrency().toLowerCase())
                    .putMetadata("serviceId", request.getServiceId().toString())
                    .putMetadata("buyerId", userId.toString())
                    .build();
 
            PaymentIntent intent = PaymentIntent.create(params);
 
            return PaymentResponseDTO.builder()
                    .paymentIntentId(intent.getId())
                    .clientSecret(intent.getClientSecret())
                    .status(intent.getStatus())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .build();
 
        } catch (Exception e) {
            throw new IllegalArgumentException("Erreur de paiement: " + e.getMessage());
        }
    }
 
    public void confirmPayment(Long userId, String paymentIntentId) {
        Stripe.apiKey = stripeSecretKey;
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            String serviceId = intent.getMetadata().get("serviceId");
 
            if (serviceId != null) {
                com.app.servicefinder.model.Service service = serviceRepository
                        .findById(Long.parseLong(serviceId)).orElse(null);
                if (service != null) {
                    notificationService.createNotification(
                        service.getUser().getId(),
                        "Paiement reçu pour votre service '" + service.getTitle() + "'",
                        "PAYMENT"
                    );
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Erreur lors de la confirmation: " + e.getMessage());
        }
    }
}