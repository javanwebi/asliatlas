import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ClubPointsProvider } from './context/ClubPointsContext';
import { WishlistProvider } from './context/WishlistContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoryPage } from './pages/CategoryPage';
import { AllCategoriesPage } from './pages/AllCategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { ClubPage } from './pages/ClubPage';
import { AgencyPage } from './pages/AgencyPage';
import { DealerPortalPage } from './pages/DealerPortalPage';
import { DemoAgenciesAdminPage } from './pages/DemoAgenciesAdminPage';
import { AiForzaPage } from './pages/AiForzaPage';
import { AiConsultPage } from './pages/AiConsultPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ConsumerDashboardPage } from './pages/ConsumerDashboardPage';
import { TileCeramicIndustryPage } from './pages/TileCeramicIndustryPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { AdminLayout } from './admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ClubPointsProvider>
              <Layout>
                <Routes>
                  {/* Dedicated AI Consult Cognivo Workspace Page */}
                  <Route path="/ai-consult" element={<AiConsultPage />} />
                  <Route path="/ai-advisor" element={<AiConsultPage />} />
                  <Route path="/cognivo" element={<AiConsultPage />} />

                  {/* Cinematic AI FORZA Face-to-Face */}
                  <Route path="/ai-forza" element={<AiForzaPage />} />
                  <Route path="/face-to-face" element={<AiForzaPage />} />

                  {/* Dedicated Registration, Login, and Onboarding */}
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />

                  {/* 1. Home Page */}
                  <Route path="/" element={<HomePage />} />

                  {/* Company Profile, About Us, History, Licenses & Awards */}
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  <Route path="/history" element={<AboutUsPage defaultTab="history" />} />
                  <Route path="/licenses" element={<AboutUsPage defaultTab="licenses" />} />
                  <Route path="/awards" element={<AboutUsPage defaultTab="awards" />} />

                  {/* Contact Us & Factory / Central Warehouse Address */}
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/factory-address" element={<ContactUsPage defaultTab="factory" />} />
                  <Route path="/address" element={<ContactUsPage defaultTab="factory" />} />

                  {/* Products Catalog Page */}
                  <Route path="/products" element={<ProductsPage />} />

                  {/* All Categories Page */}
                  <Route path="/categories" element={<AllCategoriesPage />} />

                  {/* Club Page */}
                  <Route path="/club" element={<ClubPage />} />

                  {/* Dedicated Tile & Ceramic Industry Page */}
                  <Route path="/category/ceramic-tiles" element={<TileCeramicIndustryPage />} />
                  <Route path="/industries/ceramic" element={<TileCeramicIndustryPage />} />
                  <Route path="/industries/tile-ceramic" element={<TileCeramicIndustryPage />} />
                  <Route path="/industry/ceramic-tile" element={<TileCeramicIndustryPage />} />

                  {/* 2. Category Listing */}
                  <Route path="/category/:slug" element={<CategoryPage />} />

                  {/* 3. Product Details */}
                  <Route path="/product/:code" element={<ProductDetailPage />} />

                  {/* 4. Search Results */}
                  <Route path="/search" element={<SearchPage />} />

                  {/* 5. Cart */}
                  <Route path="/cart" element={<CartPage />} />

                  {/* Dedicated Wishlist Page (Public, Independent & Locally Stored) */}
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/favorites" element={<Navigate to="/wishlist" replace />} />

                  {/* 6. Checkout (Protected) */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 7. Account Customer Portals (Protected) */}
                  <Route
                    path="/consumer-dashboard/*"
                    element={
                      <ProtectedRoute>
                        <ConsumerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/retail-account/*"
                    element={
                      <ProtectedRoute>
                        <ConsumerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/*"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 8. Agency, Dealer, and Admin Portals */}
                  <Route path="/agency/*" element={<AgencyPage />} />
                  <Route path="/dealer/*" element={<DealerPortalPage />} />
                  <Route path="/admin/demo-agencies" element={<DemoAgenciesAdminPage />} />
                  <Route path="/admin/*" element={<AdminLayout />} />

                  {/* 9. Full-screen Cinematic AI FORZA Experience */}
                  <Route path="/forza" element={<Navigate to="/ai-forza" replace />} />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ClubPointsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
