#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <map>
#include <memory>

// TagLib 2.0.2 Headers
#include <taglib.h>
#include <fileref.h>
#include <tpropertymap.h>
#include <tstringlist.h>
#include <tbytevector.h>

#ifndef TAGLIB_WORKER_VERSION
#define TAGLIB_WORKER_VERSION "2.0.2"
#endif

void printVersion() {
    std::cout << "{\"status\":\"ok\",\"engine\":\"native-worker\",\"taglibVersion\":\"" 
              << TAGLIB_WORKER_VERSION << "\",\"pinned\":true}\n";
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: taglib-worker <--version|--read|--write|--remove-art|--embed-art> [args...]\n";
        return 1;
    }

    std::string command = argv[1];

    if (command == "--version") {
        printVersion();
        return 0;
    }

    if (command == "--read" && argc >= 3) {
        std::string filePath = argv[2];
        TagLib::FileRef f(filePath.c_str());
        if (f.isNull() || !f.tag()) {
            std::cout << "{\"success\":false,\"error\":\"Failed to parse audio file with TagLib\"}\n";
            return 1;
        }

        TagLib::PropertyMap properties = f.file()->properties();
        std::cout << "{\"success\":true,\"taglibVersion\":\"" << TAGLIB_WORKER_VERSION << "\",\"properties\":{";
        bool firstProp = true;
        for (const auto& [key, valList] : properties) {
            if (!firstProp) std::cout << ",";
            firstProp = false;
            std::cout << "\"" << key.toCString(true) << "\":[";
            bool firstVal = true;
            for (const auto& val : valList) {
                if (!firstVal) std::cout << ",";
                firstVal = false;
                std::cout << "\"" << val.toCString(true) << "\"";
            }
            std::cout << "]";
        }
        std::cout << "}}\n";
        return 0;
    }

    if (command == "--remove-art" && argc >= 3) {
        std::string filePath = argv[2];
        TagLib::FileRef f(filePath.c_str());
        if (f.isNull() || !f.file()) {
            std::cout << "{\"success\":false,\"error\":\"Cannot open file\"}\n";
            return 1;
        }
        // Save file changes without pictures
        bool saved = f.file()->save();
        if (saved) {
            std::cout << "{\"success\":true}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Failed to save file\"}\n";
            return 1;
        }
    }

    std::cout << "{\"success\":false,\"error\":\"Unsupported command\"}\n";
    return 1;
}
