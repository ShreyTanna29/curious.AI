"use client";
import Heading from "@/components/extra/heading";
import { Wallet, Sprout, TreePine, Trees, ShoppingCart, IndianRupee} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function SubcriptionPage(){
    const tools = [
        {
          label: "Free",
          price:0,
          description:
            "You can decide the features and pricing as you wish // this is my first Open source contribution Be kind Thank you",
          icon: Sprout,
          color: "text-violet-500",
          bgColor: "bg-violet-500/10",
        },
        {
          label: "Personal",
          price:499,
          description:
            "You can decide the features and pricing as you wish // this is my first Open source contribution Be kind Thank you",
          icon: TreePine,
          color: "text-pink-500",
          bgColor: "bg-pink-500/10",
        },
        {
          label: "Business",
          price:999,
          description:
            "You can decide the features and pricing as you wish // this is my first Open source contribution Be kind Thank you",
          icon: Trees,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        }
    ]
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
            },
        },
    };
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };
    
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };
    return(
        <div>
            <Heading title="Plans and Pricing"
                    description="Curious offers a variety of plans to meet your AI needs."
                    icon={Wallet}
                    iconColor="text-gray-700 dark:text-white"
                    bgColor="bg-gray-700/10 dark:bg-white/10 " />

            <AnimatePresence mode="wait">
              <motion.div
                className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 relative"
                initial="initial"
                animate="animate"
                variants={pageVariants}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />

                <div className="w-full max-w-6xl mx-auto px-4 py-12 relative">
                  

                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {tools.map((tool) => (
                      <motion.div key={tool.price} variants={item}>
                        <Card
                          className={cn(
                            "p-8 border-2 border-transparent hover:border-primary/20",
                            "hover:shadow-xl hover:shadow-primary/10 transition-all duration-300",
                            "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950",
                            "cursor-pointer relative overflow-hidden group backdrop-blur-sm",
                            "hover:scale-[1.02] transform-gpu"
                          )}
                          onClick={() =>{}}
                        >
                          <div className="  z-10 relative">
                            
                          <div className={cn("p-4 rounded-2xl mb-2", tool.bgColor, "group-hover:scale-110 transition-transform duration-300")}>
                            <div className="flex items-center justify-center">
                                <tool.icon className={cn("w-8 h-8", tool.color)} />
                            </div>
                          </div>
                          <div>
                                <div className="flex justify-between m-3">
                                    <h3 className="font-semibold text-xl mb-2">{tool.label}</h3>
                                    <div className="flex">
                                        <div className="p-1">
                                            <IndianRupee/>
                                        </div>
                                        <div className="font-semibold text-xl">
                                            {tool.price} 
                                        </div>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {tool.description}
                                </p>
                          </div>
                            
                            <motion.div
                              className="z-10 relative mt-5"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <div className="flex justify-center border-2 border-solid rounded-xl p-2">
                                <ShoppingCart
                                className={cn("w-6 h-6 transition-colors mr-2", tool.color)}
                                />
                                <div className="text-muted-foreground text-sm leading-relaxed">
                                    Check out
                                </div>
                              </div>
                              
                            </motion.div>
                          </div>
                      
                          {/* Enhanced background gradient effect on hover */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(180deg, ${
                                tool.color.includes("violet")
                                  ? "#0ff0ff"
                                  : tool.color.includes("green")
                                  ? "#10b981"
                                  : tool.color.includes("orange")
                                  ? "#f59e0b"
                                  : "#6b7280"
                              } 0%, transparent 100%)`,
                            }}
                          />
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                
                  <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
        </div>
    )
}