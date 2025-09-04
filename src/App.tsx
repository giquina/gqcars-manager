import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Phone, Mail, MapPin, Fuel, Users, Gauge } from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'

// Sample car data - in a real app this would come from an API
const cars = [
  {
    id: 1,
    make: "BMW",
    model: "M5 Competition",
    year: 2024,
    price: 125000,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    mileage: 1200,
    fuel: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    features: ["Premium Sound", "Navigation", "Leather Seats", "Sunroof"],
    description: "Experience the perfect balance of luxury and performance with the BMW M5 Competition. This sedan delivers extraordinary power while maintaining the sophistication expected from BMW."
  },
  {
    id: 2,
    make: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    price: 135000,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    mileage: 800,
    fuel: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    features: ["Massage Seats", "Premium Audio", "Advanced Safety", "Air Suspension"],
    description: "The Mercedes-Benz S-Class represents the pinnacle of automotive luxury, featuring cutting-edge technology and unparalleled comfort for the most discerning drivers."
  },
  {
    id: 3,
    make: "Audi",
    model: "RS7 Sportback",
    year: 2023,
    price: 142000,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    mileage: 2500,
    fuel: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    features: ["Sport Exhaust", "Carbon Fiber", "Performance Seats", "Quattro AWD"],
    description: "The Audi RS7 Sportback combines stunning design with incredible performance, delivering a driving experience that's both exhilarating and refined."
  },
  {
    id: 4,
    make: "Porsche",
    model: "911 Turbo S",
    year: 2024,
    price: 235000,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    mileage: 500,
    fuel: "Gasoline",
    transmission: "PDK",
    seats: 4,
    features: ["Sport Chrono", "PASM", "Carbon Brakes", "Sport Exhaust"],
    description: "The legendary Porsche 911 Turbo S delivers uncompromising performance with everyday usability, representing the ultimate expression of the 911 lineage."
  },
  {
    id: 5,
    make: "Bentley",
    model: "Continental GT",
    year: 2023,
    price: 285000,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
    mileage: 1800,
    fuel: "Gasoline",
    transmission: "Automatic",
    seats: 4,
    features: ["Handcrafted Interior", "Premium Leather", "Diamond Quilting", "Mulliner Spec"],
    description: "The Bentley Continental GT epitomizes British luxury and craftsmanship, offering a perfect blend of performance and opulence for the most exclusive driving experience."
  },
  {
    id: 6,
    make: "Lamborghini",
    model: "Huracán EVO",
    year: 2024,
    price: 275000,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    mileage: 300,
    fuel: "Gasoline",
    transmission: "Dual-Clutch",
    seats: 2,
    features: ["Track Mode", "Carbon Fiber", "Sport Exhaust", "Alcantara"],
    description: "The Lamborghini Huracán EVO delivers pure Italian supercar excellence with razor-sharp performance and unmistakable style that commands attention everywhere."
  }
]

function App() {
  const [selectedCar, setSelectedCar] = useState<typeof cars[0] | null>(null)
  const [filterBrand, setFilterBrand] = useState<string>("all")
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const filteredCars = filterBrand === "all" 
    ? cars 
    : cars.filter(car => car.make.toLowerCase() === filterBrand.toLowerCase())

  const brands = ["all", ...Array.from(new Set(cars.map(car => car.make)))]

  const handleInquiry = () => {
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      toast.error("Please fill in all required fields")
      return
    }
    toast.success("Thank you for your inquiry! We'll contact you within 24 hours.")
    setInquiryForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            GQ<span className="text-accent">Cars</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium">
            Premium Luxury Vehicles for Discerning Drivers
          </p>
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            Discover our curated collection of the world's finest automobiles, 
            where exceptional quality meets uncompromising performance.
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg"
            onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Car className="mr-2" size={24} />
            View Collection
          </Button>
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Premium Collection</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each vehicle in our collection represents the pinnacle of automotive excellence, 
            carefully selected for performance, luxury, and prestige.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-12 flex justify-center">
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand === "all" ? "All Brands" : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map(car => (
            <Card key={car.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent text-accent-foreground font-semibold">
                    {car.year}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">
                  {car.make} {car.model}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-accent">
                  ${car.price.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Gauge size={16} />
                    {car.mileage.toLocaleString()} mi
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel size={16} />
                    {car.fuel}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    {car.seats} seats
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {car.features.slice(0, 2).map(feature => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {car.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{car.features.length - 2} more
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setSelectedCar(car)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-3xl">
                        {car.make} {car.model}
                      </DialogTitle>
                      <DialogDescription className="text-xl font-semibold text-accent">
                        ${car.price.toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <img 
                          src={car.image} 
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-80 object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {car.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="font-semibold">Year</Label>
                            <p>{car.year}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Mileage</Label>
                            <p>{car.mileage.toLocaleString()} miles</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Fuel Type</Label>
                            <p>{car.fuel}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Transmission</Label>
                            <p>{car.transmission}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="font-semibold mb-2 block">Features</Label>
                          <div className="flex flex-wrap gap-1">
                            {car.features.map(feature => (
                              <Badge key={feature} variant="secondary">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-semibold">Interested in this vehicle?</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="Your name"
                              value={inquiryForm.name}
                              onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Input 
                              placeholder="Email"
                              type="email"
                              value={inquiryForm.email}
                              onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <Input 
                            placeholder="Phone (optional)"
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                          <Textarea 
                            placeholder="Message or questions..."
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                          />
                          <Button onClick={handleInquiry} className="w-full">
                            Send Inquiry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Visit Our Showroom</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Experience luxury firsthand at our premium dealership location
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <MapPin size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">
                123 Premium Drive<br />
                Luxury District, NY 10001
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Phone size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground">
                (555) 123-CARS<br />
                Available 9 AM - 8 PM
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Mail size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">
                sales@gqcars.com<br />
                info@gqcars.com
              </p>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Phone className="mr-2" size={20} />
              Call Now
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="mr-2" size={20} />
              Email Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">GQCars</h3>
          <p className="text-primary-foreground/80 mb-6">
            Your premier destination for luxury automotive excellence
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <span>© 2024 GQCars. All rights reserved.</span>
            <span>•</span>
            <span>Licensed Dealer</span>
            <span>•</span>
            <span>Premium Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App